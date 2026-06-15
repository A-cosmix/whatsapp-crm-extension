import { ApplicationError } from '@domain/errors';
import { Lead } from '@domain/entities/lead';
import { PhoneNumber } from '@domain/value-objects/phone-number';
import type { ILeadRepository } from '@domain/repositories/lead.repository';
import type { IMessageBus } from '@domain/services/interfaces';
import { MessageTypes } from '@domain/messages';
import type { CreateLeadDto } from '../dto';

export class CreateLeadUseCase {
  constructor(
    private readonly leadRepo: ILeadRepository,
    private readonly messageBus: IMessageBus,
    private readonly generateId: () => string,
  ) {}

  async execute(input: CreateLeadDto): Promise<Lead> {
    const phone = new PhoneNumber(input.phone);
    const existing = await this.leadRepo.findByPhone(phone);
    if (existing) {
      throw new ApplicationError('Lead with this phone already exists', 'LEAD_EXISTS');
    }

    const byChat = await this.leadRepo.findByChatId(input.chatId);
    if (byChat) {
      throw new ApplicationError('Lead for this chat already exists', 'LEAD_EXISTS');
    }

    const lead = Lead.create({
      id: this.generateId(),
      phone: phone.value,
      name: input.name,
      chatId: input.chatId,
      source: input.source,
    });

    await this.leadRepo.save(lead);
    await this.messageBus.publish(MessageTypes.LEAD_CREATED, { leadId: lead.id });
    return lead;
  }
}
