import { DEFAULT_AI_CONFIG, type AIConfig } from '@domain/messages';

const AI_CONFIG_KEY = 'ai_config';

export class ChromeSettingsStore implements ISettingsStore {
  async getAIConfig(): Promise<AIConfig> {
    const result = await chrome.storage.local.get(AI_CONFIG_KEY);
    return (result[AI_CONFIG_KEY] as AIConfig | undefined) ?? DEFAULT_AI_CONFIG;
  }

  async setAIConfig(config: AIConfig): Promise<void> {
    await chrome.storage.local.set({ [AI_CONFIG_KEY]: config });
  }
}
