import type { IJobMatchRepository, IJobRepository, ILLMProvider, IResumeRepository } from '@domain/repositories/interfaces';
import type { JobDescription, JobMatch } from '@domain/entities';
import { PremiumRequiredError } from '@domain/errors';
import { generateId } from '@domain/value-objects';
import { JobMatchRequestSchema } from '../dto';

export class MatchJobUseCase {
  constructor(
    private readonly jobRepo: IJobRepository,
    private readonly matchRepo: IJobMatchRepository,
    private readonly resumeRepo: IResumeRepository,
    private readonly llm: ILLMProvider,
    private readonly isPremium: () => Promise<boolean>,
  ) {}

  async execute(userId: string, input: unknown): Promise<JobMatch> {
    if (!(await this.isPremium())) {
      throw new PremiumRequiredError('Job Match Scoring');
    }

    const parsed = JobMatchRequestSchema.parse(input);
    const resume = await this.resumeRepo.getLatest(userId);
    if (!resume) {
      throw new Error('Please upload a resume first');
    }

    const job: JobDescription = {
      id: generateId(),
      title: parsed.jobTitle,
      company: parsed.company,
      location: parsed.location ?? 'Remote',
      description: parsed.jobDescription,
      source: 'unknown',
      url: parsed.url ?? '',
      scrapedAt: new Date().toISOString(),
    };
    await this.jobRepo.save(job);

    const matchResult = await this.llm.matchJob(resume.content, parsed.jobDescription);
    const match: JobMatch = {
      id: generateId(),
      jobId: job.id,
      resumeId: resume.id,
      ...matchResult,
      matchedAt: new Date().toISOString(),
    };
    await this.matchRepo.save(match);

    return match;
  }
}
