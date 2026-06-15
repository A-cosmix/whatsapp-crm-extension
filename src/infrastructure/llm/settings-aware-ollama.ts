import type { ILLMProvider, LLMRequest } from '@domain/services/interfaces';
import type { ISettingsStore } from '@domain/services/platform.interfaces';
import { OllamaProvider, collectLLMResponse } from './ollama-provider';

export { collectLLMResponse };

export class SettingsAwareOllamaProvider implements ILLMProvider {
  readonly id = 'ollama-settings';

  constructor(private readonly settings: ISettingsStore) {}

  private async getProvider(): Promise<OllamaProvider> {
    const config = await this.settings.getAIConfig();
    return new OllamaProvider(config.ollamaUrl);
  }

  async isAvailable(): Promise<boolean> {
    return (await this.getProvider()).isAvailable();
  }

  async *generate(request: LLMRequest): AsyncIterable<string> {
    const config = await this.settings.getAIConfig();
    const provider = await this.getProvider();
    yield* provider.generate({
      ...request,
      model: request.model || config.ollamaModel,
      maxTokens: request.maxTokens ?? config.maxTokensPerRequest,
    });
  }

  async embed(text: string): Promise<number[]> {
    return (await this.getProvider()).embed(text);
  }
}