import type { IReminderRepository } from '@domain/repositories/reminder.repository';
import type { Reminder } from '@domain/entities/reminder';
import type { ReminderStatus } from '@domain/entities/reminder';
import { getDatabase } from './dexie-storage';
import { reminderToDomain, reminderToRow } from './mappers/reminder.mapper';

export class DexieReminderRepository implements IReminderRepository {
  async findById(id: string): Promise<Reminder | null> {
    const row = await getDatabase().reminders.get(id);
    return row ? reminderToDomain(row) : null;
  }

  async findPending(): Promise<Reminder[]> {
    const rows = await getDatabase().reminders
      .where('status')
      .equals('pending')
      .toArray();
    return rows.map(reminderToDomain);
  }

  async findByLeadId(leadId: string): Promise<Reminder[]> {
    const rows = await getDatabase().reminders.where('leadId').equals(leadId).toArray();
    return rows.map(reminderToDomain);
  }

  async findByStatus(status: ReminderStatus): Promise<Reminder[]> {
    const rows = await getDatabase().reminders.where('status').equals(status).toArray();
    return rows.map(reminderToDomain);
  }

  async save(reminder: Reminder): Promise<void> {
    await getDatabase().reminders.put(reminderToRow(reminder));
  }

  async delete(id: string): Promise<void> {
    await getDatabase().reminders.delete(id);
  }
}
