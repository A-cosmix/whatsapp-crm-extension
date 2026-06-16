import { z } from 'zod';

const ClaudeResponseSchema = z.object({
  content: z.array(
    z.object({
      type: z.string(),
      text: z.string().optional(),
    }),
  ),
  model: z.string().optional(),
  usage: z
    .object({
      input_tokens: z.number(),
      output_tokens: z.number(),
    })
    .optional(),
});

const WordExplanationSchema = z.object({
  meaning: z.string(),
  pronunciation: z.string(),
  hindiMeaning: z.string(),
  simpleExplanation: z.string(),
});

export type WordExplanation = z.infer<typeof WordExplanationSchema>;

async function getApiKey(): Promise<string> {
  const result = await chrome.storage.local.get('claudeApiKey');
  const key = result.claudeApiKey as string | undefined;
  if (!key) {
    throw new Error('Claude API key not configured. Add it in Settings.');
  }
  return key;
}

export async function callClaude(prompt: string, maxTokens = 500): Promise<string> {
  const apiKey = await getApiKey();

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429) {
      throw new Error('Rate limit reached. Please wait a moment and try again.');
    }
    if (response.status === 401) {
      throw new Error('Invalid API key. Check your Claude API key in Settings.');
    }
    throw new Error(`AI request failed: ${response.status} - ${errorText}`);
  }

  const data = ClaudeResponseSchema.parse(await response.json());
  const textBlock = data.content.find((block) => block.type === 'text');
  if (!textBlock?.text) {
    throw new Error('No response from AI');
  }
  return textBlock.text;
}

export async function explainText(prompt: string): Promise<string> {
  return callClaude(prompt, 500);
}

export async function explainWord(prompt: string): Promise<WordExplanation> {
  const response = await callClaude(prompt, 300);
  try {
    const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
    return WordExplanationSchema.parse(JSON.parse(cleaned));
  } catch {
    return {
      meaning: response,
      pronunciation: '',
      hindiMeaning: '',
      simpleExplanation: response,
    };
  }
}

export async function generateNotes(prompt: string): Promise<string> {
  return callClaude(prompt, 1500);
}

export async function summarizeContent(prompt: string): Promise<string> {
  return callClaude(prompt, 2000);
}

export function hashText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `cache_${Math.abs(hash)}`;
}
