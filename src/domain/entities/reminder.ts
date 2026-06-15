import { DomainError } from '../errors';

export type ReminderStatus = 'pending' | 'fired' | 'snoozed' | 'dismissed';
export type ReminderRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface ReminderProps {
  id: string;
  leadId: string;
  chatId: string;
  title: string;
  note?: string;
  dueAt: number;
  status: ReminderStatus;
  recurrence: ReminderRecurrence;
  createdAt: number;
  snoozedUntil?: number;
}

export class Reminder {
  readonly id: string;
  readonly leadId: string;
  readonly chatId: string;
  title: string;
  note?: string;
  dueAt: number;
  status: ReminderStatus;
  recurrence: ReminderRecurrence;
  readonly createdAt: number;
  snoozedUntil?: number;

  private constructor(props: ReminderProps) {
    this.id = props.id;
    this.leadId = props.leadId;
    this.chatId = props.chatId;
    this.title = props.title;
    this.note = props.note;
    this.dueAt = props.dueAt;
    this.status = props.status;
    this.recurrence = props.recurrence;
    this.createdAt = props.createdAt;
    this.snoozedUntil = props.snoozedUntil;
  }

  static create(input: {
    id: string;
    leadId: string;
    chatId: string;
    title: string;
    dueAt: number;
    note?: string;
    recurrence?: ReminderRecurrence;
  }): Reminder {
    if (input.dueAt <= Date.now()) {
      throw new DomainError('Reminder due time must be in the future');
    }
    return new Reminder({
      id: input.id,
      leadId: input.leadId,
      chatId: input.chatId,
      title: input.title,
      note: input.note,
      dueAt: input.dueAt,
      status: 'pending',
      recurrence: input.recurrence ?? 'none',
      createdAt: Date.now(),
    });
  }

  static reconstitute(props: ReminderProps): Reminder {
    return new Reminder(props);
  }

  markFired(): void {
    this.status = 'fired';
  }

  snooze(until: number): void {
    if (until <= Date.now()) {
      throw new DomainError('Snooze time must be in the future');
    }
    this.status = 'snoozed';
    this.snoozedUntil = until;
    this.dueAt = until;
  }

  dismiss(): void {
    this.status = 'dismissed';
  }

  toJSON(): ReminderProps {
    return {
      id: this.id,
      leadId: this.leadId,
      chatId: this.chatId,
      title: this.title,
      note: this.note,
      dueAt: this.dueAt,
      status: this.status,
      recurrence: this.recurrence,
      createdAt: this.createdAt,
      snoozedUntil: this.snoozedUntil,
    };
  }
}
