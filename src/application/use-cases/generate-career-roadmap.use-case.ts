import type { ICareerRoadmapRepository, ILLMProvider, IResumeRepository } from '@domain/repositories/interfaces';
import type { CareerRoadmap } from '@domain/entities';
import { PremiumRequiredError } from '@domain/errors';
import { generateId } from '@domain/value-objects';
import { CareerRoadmapRequestSchema } from '../dto';

export class GenerateCareerRoadmapUseCase {
  constructor(
    private readonly roadmapRepo: ICareerRoadmapRepository,
    private readonly resumeRepo: IResumeRepository,
    private readonly llm: ILLMProvider,
    private readonly isPremium: () => Promise<boolean>,
  ) {}

  async execute(userId: string, input: unknown): Promise<CareerRoadmap> {
    if (!(await this.isPremium())) {
      throw new PremiumRequiredError('Career Roadmaps');
    }

    const parsed = CareerRoadmapRequestSchema.parse(input);
    const resume = await this.resumeRepo.getLatest(userId);
    const currentSkills = parsed.currentSkills ?? (resume ? [] : []);

    const result = await this.llm.generateCareerRoadmap(parsed.dreamJob, currentSkills);
    const roadmap: CareerRoadmap = {
      id: generateId(),
      ...result,
      generatedAt: new Date().toISOString(),
    };
    await this.roadmapRepo.save(roadmap);
    return roadmap;
  }
}
