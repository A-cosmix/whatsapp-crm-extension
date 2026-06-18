import type { IJobRepository, ILLMProvider } from '@domain/repositories/interfaces';
import type { InterviewPrep } from '@domain/entities';
import { PremiumRequiredError } from '@domain/errors';
import { generateId } from '@domain/value-objects';
import { InterviewPrepRequestSchema } from '../dto';

export class GenerateInterviewPrepUseCase {
  constructor(
    private readonly jobRepo: IJobRepository,
    private readonly llm: ILLMProvider,
    private readonly isPremium: () => Promise<boolean>,
  ) {}

  async execute(jobId: string, input: unknown): Promise<InterviewPrep> {
    if (!(await this.isPremium())) {
      throw new PremiumRequiredError('Interview Prep AI');
    }

    const parsed = InterviewPrepRequestSchema.parse(input);
    const job = await this.jobRepo.getById(jobId);
    const jobDescription = job?.description ?? parsed.jobDescription;

    const result = await this.llm.generateInterviewPrep(jobDescription, parsed.difficulty);
    return {
      id: generateId(),
      jobId,
      ...result,
      generatedAt: new Date().toISOString(),
    };
  }
}
