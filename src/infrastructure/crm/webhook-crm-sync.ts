import type { ICrmSyncService } from '@domain/services/crm-sync.interface';
import type { ISettingsStore } from '@domain/services/platform.interfaces';
import { InfrastructureError } from '@domain/errors';

export class WebhookCrmSyncService implements ICrmSyncService {
  constructor(private readonly settings: ISettingsStore) {}

  async syncLead(lead: {
    id: string;
    name: string;
    phone: string;
    stage: string;
    chatId: string;
    updatedAt: number;
  }): Promise<void> {
    const config = await this.settings.getCrmSyncConfig();
    if (!config.enabled || !config.webhookUrl) return;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ event: 'lead.updated', lead, timestamp: Date.now() }),
    });

    if (!response.ok) {
      throw new InfrastructureError(`CRM sync failed: ${response.status}`, true);
    }
  }
}
