import { ApplicationError } from '@domain/errors';
import type { Lead } from '@domain/entities/lead';
import type { ILeadRepository } from '@domain/repositories/lead.repository';
import type { IMessageBus } from '@domain/services/interfaces';
import { MessageTypes } from '@domain/messages';

export class GetLeadsUseCase {
  constructor(private readonly leadRepo: ILeadRepository) {}

  async execute(): Promise<Lead[]> {
    return this.leadRepo.findAll();
  }
}

export class UpdateLeadStageUseCase {
  constructor(
    private readonly leadRepo: ILeadRepository,
    private readonly messageBus: IMessageBus,
  ) {}

  async execute(input: { leadId: string; stage: Lead['stage'] }): Promise<Lead> {
    const lead = await this.leadRepo.findById(input.leadId);
    if (!lead) {
      throw new ApplicationError('Lead not found', 'LEAD_NOT_FOUND');
    }

    lead.changeStage(input.stage);
    await this.leadRepo.save(lead);
    await this.messageBus.publish(MessageTypes.LEAD_UPDATED, { leadId: lead.id });
    return lead;
  }
}
