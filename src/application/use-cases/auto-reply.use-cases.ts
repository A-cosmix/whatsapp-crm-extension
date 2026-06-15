import { ApplicationError } from '@domain/errors';
import { AutoReplyConfig } from '@domain/entities/auto-reply-config';
import type { IAutoReplyRepository } from '@domain/repositories/auto-reply.repository';
import type { ILLMProvider } from '@domain/services/interfaces';
import type { ISettingsStore } from '@domain/services/platform.interfaces';
import type { IWhatsAppAdapter } from '@domain/services/interfaces';
import type { IReplyTriageAgent } from '@domain/agents/agent.types';
import type { IOutreachAgent } from '@domain/agents/agent.types';
import type { ISupervisorAgent } from '@domain/agents/agent.types';
import { MessageTypes } from '@domain/messages';
import type { IMessageBus } from '@domain/services/interfaces';
import type { SendAutoReplyDto } from '../dto';

function randomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class ToggleAutoReplyUseCase {
  constructor(private readonly autoReplyRepo: IAutoReplyRepository) {}

  async execute(input: { chatId: string; enabled: boolean }): Promise<AutoReplyConfig> {
    let config = await this.autoReplyRepo.findByChatId(input.chatId);
    if (!config) {
      config = AutoReplyConfig.createDefault(input.chatId);
    }
    config.toggle(input.enabled);
    await this.autoReplyRepo.save(config);
    return config;
  }
}

export class SendAutoReplyUseCase {
  constructor(
    private readonly autoReplyRepo: IAutoReplyRepository,
    private readonly llm: ILLMProvider,
    private readonly whatsapp: IWhatsAppAdapter,
    private readonly triageAgent: IReplyTriageAgent,
    private readonly outreachAgent: IOutreachAgent,
    private readonly supervisor: ISupervisorAgent,
    private readonly settings: ISettingsStore,
    private readonly messageBus: IMessageBus,
  ) {}

  async execute(input: SendAutoReplyDto): Promise<{ sent: boolean; reason: string }> {
    const config = await this.autoReplyRepo.findByChatId(input.chatId);
    if (!config?.enabled) {
      return { sent: false, reason: 'Auto-reply disabled for this chat' };
    }

    if (config.excludeGroups && input.isGroup) {
      return { sent: false, reason: 'Groups excluded from auto-reply' };
    }

    const triageHandoff = await this.triageAgent.triage(input.messageText, 'prospect');
    const triageDecision = await this.supervisor.evaluate(triageHandoff);

    if (!triageHandoff.payload.shouldAutoReply || !triageDecision.approved) {
      await this.messageBus.publish(MessageTypes.AUTO_REPLY_QUEUED, {
        chatId: input.chatId,
        reason: triageDecision.reason,
      });
      return { sent: false, reason: triageDecision.reason };
    }

    const messages = await this.whatsapp.getRecentMessages(input.chatId, config.maxHistoryMessages);
    const context = messages.map((m) => `${m.role}: ${m.text}`).join('\n');

    const aiConfig = await this.settings.getAIConfig();
    const outreachHandoff = await this.outreachAgent.draft(
      context,
      config.systemPrompt ?? aiConfig.systemPrompt,
    );

    const outreachDecision = await this.supervisor.evaluate(outreachHandoff);
    const threshold = config.confidenceThreshold;

    if (
      !outreachDecision.approved ||
      outreachHandoff.confidence < threshold
    ) {
      await this.messageBus.publish(MessageTypes.AUTO_REPLY_QUEUED, {
        chatId: input.chatId,
        reason: 'Low confidence — queued for review',
      });
      return { sent: false, reason: 'Low confidence — queued for review' };
    }

    const delay = randomDelay(config.minDelayMs, config.maxDelayMs);
    await new Promise((resolve) => setTimeout(resolve, delay));

    const connected = await this.whatsapp.isConnected();
    if (!connected) {
      throw new ApplicationError('WhatsApp is not connected', 'WHATSAPP_DISCONNECTED');
    }

    const result = await this.whatsapp.send(input.chatId, outreachHandoff.payload.message);
    if (!result.success) {
      throw new ApplicationError(result.error ?? 'Failed to send message', 'SEND_FAILED');
    }

    await this.messageBus.publish(MessageTypes.AUTO_REPLY_SENT, {
      chatId: input.chatId,
      message: outreachHandoff.payload.message,
    });

    return { sent: true, reason: 'Auto-reply sent' };
  }
}
