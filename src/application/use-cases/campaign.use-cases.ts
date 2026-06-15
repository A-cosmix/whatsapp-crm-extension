import { ApplicationError } from '@domain/errors';
import {
  Campaign,
  CampaignRecipient,
  personalizeTemplate,
} from '@domain/entities/campaign';
import type { ICampaignRepository, ICampaignRecipientRepository } from '@domain/repositories/campaign.repository';
import type { ILeadRepository } from '@domain/repositories/lead.repository';
import type { IWhatsAppAdapter } from '@domain/services/interfaces';
import type { IDailySendTracker } from '@domain/services/crm-sync.interface';
import type { IAlarmScheduler } from '@domain/services/platform.interfaces';
import type { IMessageBus } from '@domain/services/interfaces';
import { MessageTypes } from '@domain/messages';
import type { CreateCampaignDto } from '../dto';

function randomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class CreateCampaignUseCase {
  constructor(
    private readonly campaignRepo: ICampaignRepository,
    private readonly recipientRepo: ICampaignRecipientRepository,
    private readonly leadRepo: ILeadRepository,
    private readonly alarmScheduler: IAlarmScheduler,
    private readonly messageBus: IMessageBus,
    private readonly generateId: () => string,
  ) {}

  async execute(input: CreateCampaignDto): Promise<Campaign> {
    const campaign = Campaign.create({
      id: this.generateId(),
      name: input.name,
      template: input.template,
      scheduledAt: input.scheduledAt,
    });

    const recipients: CampaignRecipient[] = [];
    for (const leadId of input.leadIds) {
      const lead = await this.leadRepo.findById(leadId);
      if (!lead) continue;
      recipients.push(
        CampaignRecipient.create({
          id: this.generateId(),
          campaignId: campaign.id,
          leadId: lead.id,
          phone: lead.phone,
          name: lead.name,
          chatId: lead.chatId,
        }),
      );
    }

    if (recipients.length === 0) {
      throw new ApplicationError('No valid leads selected', 'NO_RECIPIENTS');
    }

    await this.campaignRepo.save(campaign);
    await this.recipientRepo.saveMany(recipients);

    const startAt = input.scheduledAt ?? Date.now() + 2000;
    campaign.start();
    await this.campaignRepo.save(campaign);
    await this.alarmScheduler.schedule(`campaign:${campaign.id}`, startAt);

    await this.messageBus.publish(MessageTypes.CAMPAIGNS_SYNC, { campaignId: campaign.id });
    return campaign;
  }
}

export class GetCampaignsUseCase {
  constructor(private readonly campaignRepo: ICampaignRepository) {}

  async execute() {
    return this.campaignRepo.findAll();
  }
}

export class PauseCampaignUseCase {
  constructor(private readonly campaignRepo: ICampaignRepository) {}

  async execute(campaignId: string): Promise<void> {
    const campaign = await this.campaignRepo.findById(campaignId);
    if (!campaign) throw new ApplicationError('Campaign not found', 'NOT_FOUND');
    campaign.pause();
    await this.campaignRepo.save(campaign);
  }
}

export class CancelCampaignUseCase {
  constructor(
    private readonly campaignRepo: ICampaignRepository,
    private readonly alarmScheduler: IAlarmScheduler,
  ) {}

  async execute(campaignId: string): Promise<void> {
    const campaign = await this.campaignRepo.findById(campaignId);
    if (!campaign) throw new ApplicationError('Campaign not found', 'NOT_FOUND');
    campaign.cancel();
    await this.campaignRepo.save(campaign);
    await this.alarmScheduler.cancel(`campaign:${campaignId}`);
  }
}

export class ResumeCampaignUseCase {
  constructor(
    private readonly campaignRepo: ICampaignRepository,
    private readonly alarmScheduler: IAlarmScheduler,
  ) {}

  async execute(campaignId: string): Promise<void> {
    const campaign = await this.campaignRepo.findById(campaignId);
    if (!campaign) throw new ApplicationError('Campaign not found', 'NOT_FOUND');
    campaign.start();
    await this.campaignRepo.save(campaign);
    await this.alarmScheduler.schedule(`campaign:${campaignId}`, Date.now() + 2000);
  }
}

export class ExecuteCampaignStepUseCase {
  constructor(
    private readonly campaignRepo: ICampaignRepository,
    private readonly recipientRepo: ICampaignRecipientRepository,
    private readonly whatsapp: IWhatsAppAdapter,
    private readonly dailyTracker: IDailySendTracker,
    private readonly alarmScheduler: IAlarmScheduler,
    private readonly messageBus: IMessageBus,
  ) {}

  async execute(campaignId: string): Promise<{ done: boolean }> {
    const campaign = await this.campaignRepo.findById(campaignId);
    if (!campaign || campaign.status !== 'running') {
      return { done: true };
    }

    const todayCount = await this.dailyTracker.getTodayCount();
    const dailyCap = await this.dailyTracker.getDailyCap();
    if (todayCount >= dailyCap) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      await this.alarmScheduler.schedule(`campaign:${campaignId}`, tomorrow.getTime());
      return { done: false };
    }

    const recipient = await this.recipientRepo.findNextPending(campaignId);
    if (!recipient) {
      campaign.complete();
      await this.campaignRepo.save(campaign);
      return { done: true };
    }

    const connected = await this.whatsapp.isConnected();
    if (!connected) {
      recipient.markFailed('WhatsApp not connected');
      await this.recipientRepo.save(recipient);
      campaign.recordFailed();
      await this.campaignRepo.save(campaign);
      await this.scheduleNext(campaignId, campaign.minDelayMs, campaign.maxDelayMs);
      return { done: false };
    }

    const message = personalizeTemplate(campaign.template, {
      name: recipient.name,
      phone: recipient.phone,
    });

    const delay = randomDelay(campaign.minDelayMs, campaign.maxDelayMs);
    await new Promise((resolve) => setTimeout(resolve, delay));

    const result = await this.whatsapp.send(recipient.chatId, message, {
      phone: recipient.phone,
      name: recipient.name,
    });
    if (result.success) {
      recipient.markSent(message);
      campaign.recordSent();
      await this.dailyTracker.increment();
    } else {
      recipient.markFailed(result.error ?? 'Send failed');
      campaign.recordFailed();
    }

    await this.recipientRepo.save(recipient);
    await this.campaignRepo.save(campaign);

    const remaining = await this.recipientRepo.findNextPending(campaignId);
    if (!remaining) {
      campaign.complete();
      await this.campaignRepo.save(campaign);
      return { done: true };
    }

    await this.scheduleNext(campaignId, campaign.minDelayMs, campaign.maxDelayMs);
    await this.messageBus.publish(MessageTypes.CAMPAIGNS_SYNC, { campaignId });
    return { done: false };
  }

  private async scheduleNext(campaignId: string, min: number, max: number): Promise<void> {
    const delay = randomDelay(min, max);
    await this.alarmScheduler.schedule(`campaign:${campaignId}`, Date.now() + delay);
  }
}
