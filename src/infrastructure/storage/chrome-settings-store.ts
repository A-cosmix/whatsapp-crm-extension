import type { ISettingsStore } from '@domain/services/platform.interfaces';
import { DEFAULT_AI_CONFIG, type AIConfig } from '@domain/messages';
import {
  DEFAULT_CRM_SYNC_CONFIG,
  type CrmSyncConfig,
} from '@domain/services/crm-sync.interface';

const AI_CONFIG_KEY = 'ai_config';
const CRM_SYNC_KEY = 'crm_sync_config';

export class ChromeSettingsStore implements ISettingsStore {
  async getAIConfig(): Promise<AIConfig> {
    const result = await chrome.storage.local.get(AI_CONFIG_KEY);
    return { ...DEFAULT_AI_CONFIG, ...(result[AI_CONFIG_KEY] as Partial<AIConfig> | undefined) };
  }

  async setAIConfig(config: AIConfig): Promise<void> {
    await chrome.storage.local.set({ [AI_CONFIG_KEY]: config });
  }

  async getCrmSyncConfig(): Promise<CrmSyncConfig> {
    const result = await chrome.storage.local.get(CRM_SYNC_KEY);
    return {
      ...DEFAULT_CRM_SYNC_CONFIG,
      ...(result[CRM_SYNC_KEY] as Partial<CrmSyncConfig> | undefined),
    };
  }

  async setCrmSyncConfig(config: CrmSyncConfig): Promise<void> {
    await chrome.storage.local.set({ [CRM_SYNC_KEY]: config });
  }
}
