export interface IAlarmScheduler {
  schedule(name: string, when: number): Promise<void>;
  cancel(name: string): Promise<void>;
  rescheduleAll(pending: Array<{ name: string; when: number }>): Promise<void>;
}

export interface INotifier {
  show(title: string, message: string, options?: { onClickUrl?: string }): Promise<void>;
}

import type { CrmSyncConfig } from './crm-sync.interface';

export interface ISettingsStore {
  getAIConfig(): Promise<import('../messages').AIConfig>;
  setAIConfig(config: import('../messages').AIConfig): Promise<void>;
  getCrmSyncConfig(): Promise<CrmSyncConfig>;
  setCrmSyncConfig(config: CrmSyncConfig): Promise<void>;
}
