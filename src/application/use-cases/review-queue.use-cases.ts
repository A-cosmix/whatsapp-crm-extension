import { ApplicationError } from '@domain/errors';
import { ReviewQueueItem } from '@domain/entities/review-queue-item';
import type { IReviewQueueRepository } from '@domain/repositories/review-queue.repository';
import type { IWhatsAppAdapter } from '@domain/services/interfaces';
import type { IMessageBus } from '@domain/services/interfaces';
import { MessageTypes } from '@domain/messages';

export class GetReviewQueueUseCase {
  constructor(private readonly reviewRepo: IReviewQueueRepository) {}

  async execute(): Promise<ReviewQueueItem[]> {
    return this.reviewRepo.findByStatus('pending');
  }
}

export class AddToReviewQueueUseCase {
  constructor(
    private readonly reviewRepo: IReviewQueueRepository,
    private readonly messageBus: IMessageBus,
    private readonly generateId: () => string,
  ) {}

  async execute(input: {
    chatId: string;
    leadId?: string;
    prospectMessage: string;
    draftMessage: string;
    reason: string;
    confidence: number;
  }): Promise<ReviewQueueItem> {
    const item = ReviewQueueItem.create({
      id: this.generateId(),
      ...input,
    });
    await this.reviewRepo.save(item);
    await this.messageBus.publish(MessageTypes.REVIEW_QUEUE_SYNC, { itemId: item.id });
    return item;
  }
}

export class ApproveReviewItemUseCase {
  constructor(
    private readonly reviewRepo: IReviewQueueRepository,
    private readonly whatsapp: IWhatsAppAdapter,
    private readonly messageBus: IMessageBus,
  ) {}

  async execute(itemId: string): Promise<void> {
    const item = await this.reviewRepo.findById(itemId);
    if (!item || item.status !== 'pending') {
      throw new ApplicationError('Review item not found', 'NOT_FOUND');
    }

    const result = await this.whatsapp.send(item.chatId, item.draftMessage);
    if (!result.success) {
      throw new ApplicationError(result.error ?? 'Send failed', 'SEND_FAILED');
    }

    item.approve();
    await this.reviewRepo.save(item);
    await this.messageBus.publish(MessageTypes.AUTO_REPLY_SENT, {
      chatId: item.chatId,
      message: item.draftMessage,
    });
  }
}

export class RejectReviewItemUseCase {
  constructor(private readonly reviewRepo: IReviewQueueRepository) {}

  async execute(itemId: string): Promise<void> {
    const item = await this.reviewRepo.findById(itemId);
    if (!item) throw new ApplicationError('Review item not found', 'NOT_FOUND');
    item.reject();
    await this.reviewRepo.save(item);
  }
}
