export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ReviewQueueItemProps {
  id: string;
  chatId: string;
  leadId?: string;
  prospectMessage: string;
  draftMessage: string;
  reason: string;
  confidence: number;
  status: ReviewStatus;
  createdAt: number;
}

export class ReviewQueueItem {
  readonly id: string;
  readonly chatId: string;
  readonly leadId?: string;
  readonly prospectMessage: string;
  draftMessage: string;
  readonly reason: string;
  readonly confidence: number;
  status: ReviewStatus;
  readonly createdAt: number;

  private constructor(props: ReviewQueueItemProps) {
    this.id = props.id;
    this.chatId = props.chatId;
    this.leadId = props.leadId;
    this.prospectMessage = props.prospectMessage;
    this.draftMessage = props.draftMessage;
    this.reason = props.reason;
    this.confidence = props.confidence;
    this.status = props.status;
    this.createdAt = props.createdAt;
  }

  static create(input: {
    id: string;
    chatId: string;
    leadId?: string;
    prospectMessage: string;
    draftMessage: string;
    reason: string;
    confidence: number;
  }): ReviewQueueItem {
    return new ReviewQueueItem({
      ...input,
      status: 'pending',
      createdAt: Date.now(),
    });
  }

  static reconstitute(props: ReviewQueueItemProps): ReviewQueueItem {
    return new ReviewQueueItem(props);
  }

  approve(): void {
    this.status = 'approved';
  }

  reject(): void {
    this.status = 'rejected';
  }

  toJSON(): ReviewQueueItemProps {
    return {
      id: this.id,
      chatId: this.chatId,
      leadId: this.leadId,
      prospectMessage: this.prospectMessage,
      draftMessage: this.draftMessage,
      reason: this.reason,
      confidence: this.confidence,
      status: this.status,
      createdAt: this.createdAt,
    };
  }
}
