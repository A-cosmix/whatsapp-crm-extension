import type { Reminder } from '../entities/reminder';
import type { ReminderStatus } from '../entities/reminder';

export interface IReminderRepository {
  findById(id: string): Promise<Reminder | null>;
  findPending(): Promise<Reminder[]>;
  findByLeadId(leadId: string): Promise<Reminder[]>;
  findByStatus(status: ReminderStatus): Promise<Reminder[]>;
  save(reminder: Reminder): Promise<void>;
  delete(id: string): Promise<void>;
}
