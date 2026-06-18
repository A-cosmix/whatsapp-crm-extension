import type { ILLMProvider } from '@domain/repositories/interfaces';
import type { SalaryInsight } from '@domain/entities';
import { PremiumRequiredError } from '@domain/errors';
import { generateId } from '@domain/value-objects';
import { SalaryInsightRequestSchema } from '../dto';

export class EstimateSalaryUseCase {
  constructor(
    private readonly llm: ILLMProvider,
    private readonly isPremium: () => Promise<boolean>,
  ) {}

  async execute(input: unknown): Promise<SalaryInsight> {
    if (!(await this.isPremium())) {
      throw new PremiumRequiredError('Salary Insights');
    }

    const parsed = SalaryInsightRequestSchema.parse(input);
    const result = await this.llm.estimateSalary(
      parsed.role,
      parsed.location,
      parsed.experienceYears,
      parsed.skills,
    );
    return {
      id: generateId(),
      ...result,
      generatedAt: new Date().toISOString(),
    };
  }
}
