import type { ICoverLetterRepository, IJobRepository, ILLMProvider, IResumeRepository, ISubscriptionRepository, IUsageRepository } from '@domain/repositories/interfaces';
import type { CoverLetter } from '@domain/entities';
import { UsageLimitExceededError } from '@domain/errors';
import { generateId } from '@domain/value-objects';
import { CoverLetterRequestSchema } from '../dto';

export class GenerateCoverLetterUseCase {
  constructor(
    private readonly resumeRepo: IResumeRepository,
    private readonly jobRepo: IJobRepository,
    private readonly coverLetterRepo: ICoverLetterRepository,
    private readonly usageRepo: IUsageRepository,
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly llm: ILLMProvider,
  ) {}

  async execute(userId: string, jobId: string, input: unknown): Promise<CoverLetter> {
    const parsed = CoverLetterRequestSchema.parse(input);
    const subscription = await this.subscriptionRepo.get();

    if (subscription.plan === 'free') {
      const usage = await this.usageRepo.get();
      if (usage.coverLettersUsed >= usage.coverLetters) {
        throw new UsageLimitExceededError('cover letters');
      }
    }

    const resume = await this.resumeRepo.getLatest(userId);
    if (!resume) throw new Error('Please upload a resume first');

    const job = await this.jobRepo.getById(jobId);
    const jobDescription = job?.description ?? parsed.jobDescription;

    const content = await this.llm.generateCoverLetter(resume.content, jobDescription, parsed.style);
    const letter: CoverLetter = {
      id: generateId(),
      jobId: jobId || generateId(),
      resumeId: resume.id,
      style: parsed.style,
      content,
      generatedAt: new Date().toISOString(),
    };
    await this.coverLetterRepo.save(letter);

    if (subscription.plan === 'free') {
      await this.usageRepo.incrementCoverLetters();
    }

    return letter;
  }
}
