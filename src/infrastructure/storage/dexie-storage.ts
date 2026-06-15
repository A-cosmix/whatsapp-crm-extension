import Dexie, { type Table } from 'dexie';
import type { LeadProps } from '@domain/entities/lead';
import type { ReminderProps } from '@domain/entities/reminder';
import type { AutoReplyConfigProps } from '@domain/entities/auto-reply-config';
import type { CampaignProps, CampaignRecipientProps } from '@domain/entities/campaign';
import type { ReviewQueueItemProps } from '@domain/entities/review-queue-item';

export interface LeadRow extends LeadProps {}
export interface ReminderRow extends ReminderProps {}
export interface AutoReplyRow extends AutoReplyConfigProps {}
export interface CampaignRow extends CampaignProps {}
export interface CampaignRecipientRow extends CampaignRecipientProps {}
export interface ReviewQueueRow extends ReviewQueueItemProps {}

export class CrmDatabase extends Dexie {
  leads!: Table<LeadRow, string>;
  reminders!: Table<ReminderRow, string>;
  autoReplyConfigs!: Table<AutoReplyRow, string>;
  campaigns!: Table<CampaignRow, string>;
  campaignRecipients!: Table<CampaignRecipientRow, string>;
  reviewQueue!: Table<ReviewQueueRow, string>;

  constructor() {
    super('WhatsAppCrmDB');
    this.version(1).stores({
      leads: 'id, phone, chatId, stage, updatedAt',
      reminders: 'id, leadId, chatId, status, dueAt',
      autoReplyConfigs: 'chatId',
    });
    this.version(2).stores({
      leads: 'id, phone, chatId, stage, updatedAt',
      reminders: 'id, leadId, chatId, status, dueAt',
      autoReplyConfigs: 'chatId',
      campaigns: 'id, status, createdAt',
      campaignRecipients: 'id, campaignId, leadId, status, sentAt, [campaignId+status]',
      reviewQueue: 'id, chatId, status, createdAt',
    });
  }
}

let dbInstance: CrmDatabase | null = null;

export function getDatabase(): CrmDatabase {
  if (!dbInstance) {
    dbInstance = new CrmDatabase();
  }
  return dbInstance;
}

export function resetDatabaseForTests(): void {
  dbInstance = new CrmDatabase();
}
