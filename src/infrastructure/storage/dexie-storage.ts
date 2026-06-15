import Dexie, { type Table } from 'dexie';
import type { LeadProps } from '@domain/entities/lead';
import type { ReminderProps } from '@domain/entities/reminder';
import type { AutoReplyConfigProps } from '@domain/entities/auto-reply-config';

export interface LeadRow extends LeadProps {}

export interface ReminderRow extends ReminderProps {}

export interface AutoReplyRow extends AutoReplyConfigProps {}

export class CrmDatabase extends Dexie {
  leads!: Table<LeadRow, string>;
  reminders!: Table<ReminderRow, string>;
  autoReplyConfigs!: Table<AutoReplyRow, string>;

  constructor() {
    super('WhatsAppCrmDB');
    this.version(1).stores({
      leads: 'id, phone, chatId, stage, updatedAt',
      reminders: 'id, leadId, chatId, status, dueAt',
      autoReplyConfigs: 'chatId',
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
