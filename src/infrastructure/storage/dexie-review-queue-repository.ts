import type { IReviewQueueRepository } from '@domain/repositories/review-queue.repository';
import { ReviewQueueItem } from '@domain/entities/review-queue-item';
import type { ReviewStatus } from '@domain/entities/review-queue-item';
import { getDatabase } from './dexie-storage';

export class DexieReviewQueueRepository implements IReviewQueueRepository {
  async findById(id: string): Promise<ReviewQueueItem | null> {
    const row = await getDatabase().reviewQueue.get(id);
    return row ? ReviewQueueItem.reconstitute(row) : null;
  }

  async findByStatus(status: ReviewStatus): Promise<ReviewQueueItem[]> {
    const rows = await getDatabase().reviewQueue
      .where('status')
      .equals(status)
      .reverse()
      .sortBy('createdAt');
    return rows.map((r) => ReviewQueueItem.reconstitute(r));
  }

  async save(item: ReviewQueueItem): Promise<void> {
    await getDatabase().reviewQueue.put(item.toJSON());
  }

  async delete(id: string): Promise<void> {
    await getDatabase().reviewQueue.delete(id);
  }
}
