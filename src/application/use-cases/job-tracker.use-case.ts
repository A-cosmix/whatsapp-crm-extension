import type { IJobTrackerRepository } from '@domain/repositories/interfaces';
import type { JobTrackerItem, JobTrackerStatus } from '@domain/entities';
import { generateId } from '@domain/value-objects';
import { JobTrackerItemSchema } from '../dto';

export class JobTrackerUseCase {
  constructor(private readonly trackerRepo: IJobTrackerRepository) {}

  async getAll(): Promise<JobTrackerItem[]> {
    return this.trackerRepo.getAll();
  }

  async getByStatus(status: JobTrackerStatus): Promise<JobTrackerItem[]> {
    return this.trackerRepo.getByStatus(status);
  }

  async add(input: unknown): Promise<JobTrackerItem> {
    const parsed = JobTrackerItemSchema.parse(input);
    const item: JobTrackerItem = {
      id: generateId(),
      title: parsed.title,
      company: parsed.company,
      location: parsed.location ?? '',
      salary: parsed.salary,
      url: parsed.url,
      status: parsed.status,
      notes: parsed.notes ?? '',
      appliedAt: parsed.status === 'applied' ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };
    await this.trackerRepo.save(item);
    return item;
  }

  async updateStatus(id: string, status: JobTrackerStatus): Promise<void> {
    await this.trackerRepo.updateStatus(id, status);
  }

  async delete(id: string): Promise<void> {
    await this.trackerRepo.delete(id);
  }
}
