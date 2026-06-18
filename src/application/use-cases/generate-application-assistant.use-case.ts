import type { IJobRepository, ILLMProvider, IResumeRepository } from '@domain/repositories/interfaces';
import type { ApplicationAssistant } from '@domain/entities';
import { generateId } from '@domain/value-objects';

export class GenerateApplicationAssistantUseCase {
  constructor(
    private readonly resumeRepo: IResumeRepository,
    private readonly jobRepo: IJobRepository,
    private readonly llm: ILLMProvider,
  ) {}

  async execute(userId: string, jobId: string): Promise<ApplicationAssistant> {
    const resume = await this.resumeRepo.getLatest(userId);
    if (!resume) throw new Error('Please upload a resume first');

    const job = await this.jobRepo.getById(jobId);
    if (!job) throw new Error('Job not found');

    const result = await this.llm.generateApplicationAnswers(resume.content, job.description);
    return {
      id: generateId(),
      jobId,
      ...result,
      generatedAt: new Date().toISOString(),
    };
  }
}
