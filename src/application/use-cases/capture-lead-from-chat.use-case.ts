import { ApplicationError } from '@domain/errors';
import { Lead } from '@domain/entities/lead';
import { PhoneNumber } from '@domain/value-objects/phone-number';
import type { ILeadRepository } from '@domain/repositories/lead.repository';
import type { IWhatsAppAdapter } from '@domain/services/interfaces';
import type { ICrmSyncService } from '@domain/services/crm-sync.interface';
import type { IMessageBus } from '@domain/services/interfaces';
import { MessageTypes } from '@domain/messages';

export class CaptureLeadFromChatUseCase {
  constructor(
    private readonly leadRepo: ILeadRepository,
    private readonly whatsapp: IWhatsAppAdapter,
    private readonly messageBus: IMessageBus,
    private readonly crmSync: ICrmSyncService,
    private readonly generateId: () => string,
  ) {}

  async execute(): Promise<Lead> {
    const connected = await this.whatsapp.isConnected();
    if (!connected) {
      throw new ApplicationError(
        'Open web.whatsapp.com in a tab and select a chat first.',
        'WHATSAPP_DISCONNECTED',
      );
    }

    const chatId = await this.whatsapp.getActiveChatId();
    if (!chatId) {
      throw new ApplicationError('No active WhatsApp chat', 'NO_ACTIVE_CHAT');
    }

    const existing = await this.leadRepo.findByChatId(chatId);
    if (existing) {
      return existing;
    }

    const contact = await this.whatsapp.getContactInfo(chatId);
    if (!contact) {
      throw new ApplicationError('Could not read contact info', 'CONTACT_READ_FAILED');
    }

    if (contact.isGroup) {
      throw new ApplicationError('Cannot capture group chats as leads', 'GROUP_NOT_ALLOWED');
    }

    let phoneRaw = contact.phone;
    if (!phoneRaw || phoneRaw.replace(/\D/g, '').length < 10) {
      phoneRaw = await this.whatsapp.scrapePhone();
    }

    if (!phoneRaw || phoneRaw.replace(/\D/g, '').length < 10) {
      throw new ApplicationError(
        'Phone not found. Click the contact name at top in WhatsApp, then try again.',
        'PHONE_NOT_FOUND',
      );
    }

    const phone = new PhoneNumber(phoneRaw);

    const lead = Lead.create({
      id: this.generateId(),
      phone: phone.value,
      name: contact.name,
      chatId: contact.chatId,
      source: 'whatsapp',
    });

    await this.leadRepo.save(lead);
    await this.messageBus.publish(MessageTypes.LEAD_CREATED, { leadId: lead.id });

    try {
      await this.crmSync.syncLead({
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        stage: lead.stage,
        chatId: lead.chatId,
        updatedAt: lead.updatedAt,
      });
    } catch {
      // CRM sync is best-effort
    }

    return lead;
  }
}
