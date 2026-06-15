import { Reminder } from '@domain/entities/reminder';
import type { ReminderProps } from '@domain/entities/reminder';
import type { ReminderRow } from '../dexie-storage';

export function reminderToDomain(row: ReminderRow): Reminder {
  return Reminder.reconstitute(row as ReminderProps);
}

export function reminderToRow(reminder: Reminder): ReminderRow {
  return reminder.toJSON();
}
