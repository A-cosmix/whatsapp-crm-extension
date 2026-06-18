import type { ILLMProvider, IResumeAnalysisRepository, IResumeRepository, ISubscriptionRepository, IUsageRepository } from '@domain/repositories/interfaces';
import type { Resume, ResumeAnalysis } from '@domain/entities';
import { UsageLimitExceededError } from '@domain/errors';
import { generateId } from '@domain/value-objects';
import { ResumeUploadSchema } from '../dto';

export class AnalyzeResumeUseCase {
  constructor(
    private readonly resumeRepo: IResumeRepository,
    private readonly analysisRepo: IResumeAnalysisRepository,
    private readonly usageRepo: IUsageRepository,
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly llm: ILLMProvider,
  ) {}

  async execute(userId: string, input: { fileName: string; content: string }): Promise<ResumeAnalysis> {
    const parsed = ResumeUploadSchema.parse(input);
    const subscription = await this.subscriptionRepo.get();

    if (subscription.plan === 'free') {
      const usage = await this.usageRepo.get();
      if (usage.resumeScansUsed >= usage.resumeScans) {
        throw new UsageLimitExceededError('resume scans');
      }
    }

    const resume: Resume = {
      id: generateId(),
      userId,
      fileName: parsed.fileName,
      content: parsed.content,
      uploadedAt: new Date().toISOString(),
    };
    await this.resumeRepo.save(resume);

    const analysisResult = await this.llm.analyzeResume(parsed.content);
    const analysis: ResumeAnalysis = {
      id: generateId(),
      resumeId: resume.id,
      ...analysisResult,
      analyzedAt: new Date().toISOString(),
    };
    await this.analysisRepo.save(analysis);

    if (subscription.plan === 'free') {
      await this.usageRepo.incrementResumeScans();
    }

    return analysis;
  }
}
