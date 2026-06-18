import type { ILLMProvider } from '@domain/repositories/interfaces';
import type { LinkedInAudit } from '@domain/entities';
import { PremiumRequiredError } from '@domain/errors';
import { generateId } from '@domain/value-objects';

export class AuditLinkedInUseCase {
  constructor(
    private readonly llm: ILLMProvider,
    private readonly isPremium: () => Promise<boolean>,
  ) {}

  async execute(profileContent: string): Promise<LinkedInAudit> {
    if (!(await this.isPremium())) {
      throw new PremiumRequiredError('LinkedIn Profile Auditor');
    }

    if (profileContent.length < 50) {
      throw new Error('Profile content is too short to analyze');
    }

    const result = await this.llm.auditLinkedInProfile(profileContent);
    return {
      id: generateId(),
      ...result,
      auditedAt: new Date().toISOString(),
    };
  }
}
