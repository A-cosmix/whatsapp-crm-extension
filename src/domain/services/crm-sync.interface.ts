export interface CrmSyncConfig {
  enabled: boolean;
  webhookUrl: string;
  apiKey?: string;
}

export const DEFAULT_CRM_SYNC_CONFIG: CrmSyncConfig = {
  enabled: false,
  webhookUrl: '',
};

export interface ICrmSyncService {
  syncLead(lead: {
    id: string;
    name: string;
    phone: string;
    stage: string;
    chatId: string;
    updatedAt: number;
  }): Promise<void>;
}

export interface IDailySendTracker {
  getTodayCount(): Promise<number>;
  increment(): Promise<number>;
  getDailyCap(): Promise<number>;
}
