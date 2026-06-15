import { ApplicationError } from '@domain/errors';
import { Reminder } from '@domain/entities/reminder';
import type { IReminderRepository } from '@domain/repositories/reminder.repository';
import type { IAlarmScheduler } from '@domain/services/platform.interfaces';
import type { IMessageBus } from '@domain/services/interfaces';
import { MessageTypes } from '@domain/messages';
import type { CreateReminderDto } from '../dto';

export class CreateReminderUseCase {
  constructor(
    private readonly reminderRepo: IReminderRepository,
    private readonly alarmScheduler: IAlarmScheduler,
    private readonly messageBus: IMessageBus,
    private readonly generateId: () => string,
  ) {}

  async execute(input: CreateReminderDto): Promise<Reminder> {
    const reminder = Reminder.create({
      id: this.generateId(),
      leadId: input.leadId,
      chatId: input.chatId,
      title: input.title,
      dueAt: input.dueAt,
      note: input.note,
    });

    await this.reminderRepo.save(reminder);
    await this.alarmScheduler.schedule(`reminder:${reminder.id}`, reminder.dueAt);
    await this.messageBus.publish(MessageTypes.REMINDER_CREATED, { reminderId: reminder.id });
    return reminder;
  }
}

export class GetRemindersUseCase {
  constructor(private readonly reminderRepo: IReminderRepository) {}

  async execute(): Promise<Reminder[]> {
    return this.reminderRepo.findByStatus('pending');
  }
}

export class HandleReminderAlarmUseCase {
  constructor(
    private readonly reminderRepo: IReminderRepository,
    private readonly notifier: import('@domain/services/platform.interfaces').INotifier,
    private readonly messageBus: IMessageBus,
  ) {}

  async execute(reminderId: string): Promise<void> {
    const reminder = await this.reminderRepo.findById(reminderId);
    if (!reminder || reminder.status !== 'pending') {
      return;
    }

    reminder.markFired();
    await this.reminderRepo.save(reminder);

    await this.notifier.show('WhatsApp CRM Reminder', reminder.title, {
      onClickUrl: `https://web.whatsapp.com/`,
    });

    await this.messageBus.publish(MessageTypes.REMINDER_FIRED, { reminderId });
  }
}

export class DismissReminderUseCase {
  constructor(private readonly reminderRepo: IReminderRepository) {}

  async execute(reminderId: string): Promise<void> {
    const reminder = await this.reminderRepo.findById(reminderId);
    if (!reminder) {
      throw new ApplicationError('Reminder not found', 'REMINDER_NOT_FOUND');
    }
    reminder.dismiss();
    await this.reminderRepo.save(reminder);
  }
}
