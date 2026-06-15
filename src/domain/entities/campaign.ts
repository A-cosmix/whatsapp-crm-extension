import { DomainError } from '../errors';

export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'running'
  | 'paused'
  | 'completed'
  | 'cancelled';

export type RecipientStatus = 'pending' | 'sent' | 'failed' | 'skipped' | 'replied';

export interface CampaignProps {
  id: string;
  name: string;
  template: string;
  status: CampaignStatus;
  scheduledAt?: number;
  createdAt: number;
  dailyCap: number;
  minDelayMs: number;
  maxDelayMs: number;
  sentCount: number;
  failedCount: number;
}

export interface CampaignRecipientProps {
  id: string;
  campaignId: string;
  leadId: string;
  phone: string;
  name: string;
  chatId: string;
  status: RecipientStatus;
  sentAt?: number;
  error?: string;
  personalizedMessage?: string;
}

export class Campaign {
  readonly id: string;
  name: string;
  template: string;
  status: CampaignStatus;
  scheduledAt?: number;
  readonly createdAt: number;
  readonly dailyCap: number;
  readonly minDelayMs: number;
  readonly maxDelayMs: number;
  sentCount: number;
  failedCount: number;

  private constructor(props: CampaignProps) {
    this.id = props.id;
    this.name = props.name;
    this.template = props.template;
    this.status = props.status;
    this.scheduledAt = props.scheduledAt;
    this.createdAt = props.createdAt;
    this.dailyCap = props.dailyCap;
    this.minDelayMs = props.minDelayMs;
    this.maxDelayMs = props.maxDelayMs;
    this.sentCount = props.sentCount;
    this.failedCount = props.failedCount;
  }

  static create(input: {
    id: string;
    name: string;
    template: string;
    scheduledAt?: number;
    dailyCap?: number;
    minDelayMs?: number;
    maxDelayMs?: number;
  }): Campaign {
    if (!input.template.trim()) {
      throw new DomainError('Campaign template cannot be empty');
    }
    return new Campaign({
      id: input.id,
      name: input.name,
      template: input.template,
      status: input.scheduledAt ? 'scheduled' : 'draft',
      scheduledAt: input.scheduledAt,
      createdAt: Date.now(),
      dailyCap: input.dailyCap ?? 50,
      minDelayMs: input.minDelayMs ?? 3000,
      maxDelayMs: input.maxDelayMs ?? 8000,
      sentCount: 0,
      failedCount: 0,
    });
  }

  static reconstitute(props: CampaignProps): Campaign {
    return new Campaign(props);
  }

  start(): void {
    if (!['draft', 'scheduled', 'paused'].includes(this.status)) {
      throw new DomainError(`Cannot start campaign in status: ${this.status}`);
    }
    this.status = 'running';
  }

  pause(): void {
    if (this.status !== 'running') {
      throw new DomainError('Can only pause running campaigns');
    }
    this.status = 'paused';
  }

  cancel(): void {
    if (['completed', 'cancelled'].includes(this.status)) {
      throw new DomainError('Campaign already finished');
    }
    this.status = 'cancelled';
  }

  complete(): void {
    this.status = 'completed';
  }

  recordSent(): void {
    this.sentCount += 1;
  }

  recordFailed(): void {
    this.failedCount += 1;
  }

  toJSON(): CampaignProps {
    return {
      id: this.id,
      name: this.name,
      template: this.template,
      status: this.status,
      scheduledAt: this.scheduledAt,
      createdAt: this.createdAt,
      dailyCap: this.dailyCap,
      minDelayMs: this.minDelayMs,
      maxDelayMs: this.maxDelayMs,
      sentCount: this.sentCount,
      failedCount: this.failedCount,
    };
  }
}

export class CampaignRecipient {
  readonly id: string;
  readonly campaignId: string;
  readonly leadId: string;
  readonly phone: string;
  readonly name: string;
  readonly chatId: string;
  status: RecipientStatus;
  sentAt?: number;
  error?: string;
  personalizedMessage?: string;

  private constructor(props: CampaignRecipientProps) {
    this.id = props.id;
    this.campaignId = props.campaignId;
    this.leadId = props.leadId;
    this.phone = props.phone;
    this.name = props.name;
    this.chatId = props.chatId;
    this.status = props.status;
    this.sentAt = props.sentAt;
    this.error = props.error;
    this.personalizedMessage = props.personalizedMessage;
  }

  static create(input: Omit<CampaignRecipientProps, 'status'>): CampaignRecipient {
    return new CampaignRecipient({ ...input, status: 'pending' });
  }

  static reconstitute(props: CampaignRecipientProps): CampaignRecipient {
    return new CampaignRecipient(props);
  }

  markSent(message: string): void {
    this.status = 'sent';
    this.sentAt = Date.now();
    this.personalizedMessage = message;
  }

  markFailed(error: string): void {
    this.status = 'failed';
    this.error = error;
  }

  markSkipped(reason: string): void {
    this.status = 'skipped';
    this.error = reason;
  }

  toJSON(): CampaignRecipientProps {
    return {
      id: this.id,
      campaignId: this.campaignId,
      leadId: this.leadId,
      phone: this.phone,
      name: this.name,
      chatId: this.chatId,
      status: this.status,
      sentAt: this.sentAt,
      error: this.error,
      personalizedMessage: this.personalizedMessage,
    };
  }
}

export function personalizeTemplate(
  template: string,
  vars: { name: string; phone: string; company?: string },
): string {
  return template
    .replace(/\{\{name\}\}/gi, vars.name)
    .replace(/\{\{phone\}\}/gi, vars.phone)
    .replace(/\{\{company\}\}/gi, vars.company ?? '');
}
