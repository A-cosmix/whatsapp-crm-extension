import type { ReviewQueueItem } from '../entities/review-queue-item';
import type { ReviewStatus } from '../entities/review-queue-item';

export interface IReviewQueueRepository {
  findById(id: string): Promise<ReviewQueueItem | null>;
  findByStatus(status: ReviewStatus): Promise<ReviewQueueItem[]>;
  save(item: ReviewQueueItem): Promise<void>;
  delete(id: string): Promise<void>;
}
