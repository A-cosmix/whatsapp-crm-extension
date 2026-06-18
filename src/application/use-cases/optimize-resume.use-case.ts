import type { IJobRepository, ILLMProvider, IResumeRepository } from '@domain/repositories/interfaces';
import type { OptimizedResume } from '@domain/entities';
import { PremiumRequiredError } from '@domain/errors';
import { generateId } from '@domain/value-objects';

export class OptimizeResumeUseCase {
  constructor(
    private readonly resumeRepo: IResumeRepository,
    private readonly jobRepo: IJobRepository,
    private readonly llm: ILLMProvider,
    private readonly isPremium: () => Promise<boolean>,
  ) {}

  async execute(userId: string, jobId: string): Promise<OptimizedResume> {
    if (!(await this.isPremium())) {
      throw new PremiumRequiredError('Resume Optimization');
    }

    const resume = await this.resumeRepo.getLatest(userId);
    if (!resume) throw new Error('Please upload a resume first');

    const job = await this.jobRepo.getById(jobId);
    if (!job) throw new Error('Job not found');

    const result = await this.llm.optimizeResume(resume.content, job.description);
    return {
      id: generateId(),
      resumeId: resume.id,
      jobId,
      ...result,
      optimizedAt: new Date().toISOString(),
    };
  }
}
