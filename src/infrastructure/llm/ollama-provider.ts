import { z } from 'zod';
import { InfrastructureError } from '@domain/errors';
import type { ILLMProvider, LLMRequest } from '@domain/services/interfaces';

const OllamaGenerateChunkSchema = z.object({
  response: z.string().optional(),
  done: z.boolean(),
});

export class OllamaProvider implements ILLMProvider {
  readonly id = 'ollama';

  constructor(private readonly baseUrl: string) {}

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, { method: 'GET' });
      return response.ok;
    } catch {
      return false;
    }
  }

  async *generate(request: LLMRequest): AsyncIterable<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: request.model,
        prompt: request.prompt,
        system: request.systemPrompt,
        stream: true,
        options: {
          num_predict: request.maxTokens ?? 500,
          temperature: request.temperature ?? 0.7,
        },
      }),
    });

    if (!response.ok) {
      let detail = '';
      try {
        detail = await response.text();
      } catch {
        // ignore
      }
      throw new InfrastructureError(
        `Ollama request failed (${response.status})${detail ? `: ${detail.slice(0, 120)}` : ''}`,
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new InfrastructureError('Ollama response has no body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.trim()) continue;
        const parsed = OllamaGenerateChunkSchema.safeParse(JSON.parse(line));
        if (parsed.success && parsed.data.response) {
          yield parsed.data.response;
        }
      }
    }
  }

  async embed(text: string): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
    });

    if (!response.ok) {
      throw new InfrastructureError(`Ollama embed failed: ${response.status}`);
    }

    const data = (await response.json()) as { embedding: number[] };
    return data.embedding;
  }
}

export async function collectLLMResponse(
  provider: ILLMProvider,
  request: LLMRequest,
): Promise<string> {
  let result = '';
  for await (const chunk of provider.generate(request)) {
    result += chunk;
  }
  return result.trim();
}
