import { AutoReplyConfig } from '@domain/entities/auto-reply-config';
import type { IAutoReplyRepository } from '@domain/repositories/auto-reply.repository';
import type { ILeadRepository } from '@domain/repositories/lead.repository';
import type { ILLMProvider, IWhatsAppAdapter, IMessageBus } from '@domain/services/interfaces';
import type { ISettingsStore } from '@domain/services/platform.interfaces';
import type { IReplyTriageAgent, IOutreachAgent, ISupervisorAgent } from '@domain/agents/agent.types';
import { MessageTypes } from '@domain/messages';
import { chatIdsMatch } from '@domain/value-objects/chat-id';
import type { AddToReviewQueueUseCase } from './review-queue.use-cases';
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
    private readonly leadRepo: ILeadRepository,
    private readonly whatsapp: IWhatsAppAdapter,
    private readonly llm: ILLMProvider,
    private readonly triageAgent: IReplyTriageAgent,
    private readonly outreachAgent: IOutreachAgent,
    private readonly supervisor: ISupervisorAgent,
    private readonly settings: ISettingsStore,
    private readonly messageBus: IMessageBus,
    private readonly addToReviewQueue: AddToReviewQueueUseCase,
  ) {}

  async execute(input: SendAutoReplyDto): Promise<{ sent: boolean; reason: string }> {
    try {
      return await this.executeInternal(input);
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : 'Auto-reply failed unexpectedly';
      await this.failWithReview(input, reason, '', 0);
      return { sent: false, reason };
    }
  }

  private async executeInternal(
    input: SendAutoReplyDto,
  ): Promise<{ sent: boolean; reason: string }> {
    const config = await this.resolveEnabledConfig(input.chatId);
    if (!config?.enabled) {
      return { sent: false, reason: 'Auto-reply disabled for this chat' };
    }

    if (config.excludeGroups && input.isGroup) {
      return { sent: false, reason: 'Groups excluded from auto-reply' };
    }

    const lead = await this.resolveLead(input.chatId);
    const sendOpts = { phone: lead?.phone, name: lead?.name };

    const triageHandoff = await this.triageAgent.triage(input.messageText, 'prospect');
    const triageDecision = await this.supervisor.evaluate(triageHandoff);

    if (!triageHandoff.payload.shouldAutoReply || !triageDecision.approved) {
      if (triageHandoff.payload.shouldEscalate) {
        await this.addToReviewQueue.execute({
          chatId: input.chatId,
          leadId: lead?.id,
          prospectMessage: input.messageText,
          draftMessage: '',
          reason: triageDecision.reason,
          confidence: triageHandoff.confidence,
        });
      }
      await this.messageBus.publish(MessageTypes.AUTO_REPLY_QUEUED, {
        chatId: input.chatId,
        reason: triageDecision.reason,
      });
      return { sent: false, reason: triageDecision.reason };
    }

    const ollamaReady = await this.llm.isAvailable();
    if (!ollamaReady) {
      const reason =
        'Ollama is not reachable. Run `ollama serve` and check Settings → Ollama URL.';
      await this.failWithReview(input, reason, '', 0, lead?.id);
      return { sent: false, reason };
    }

    let messages;
    try {
      messages = await this.whatsapp.getRecentMessages(
        input.chatId,
        config.maxHistoryMessages,
        sendOpts,
      );
    } catch (error) {
      const reason =
        error instanceof Error
          ? error.message
          : 'Could not read WhatsApp messages for this chat';
      await this.failWithReview(input, reason, '', 0, lead?.id);
      return { sent: false, reason };
    }

    const context = messages.map((m) => `${m.role}: ${m.text}`).join('\n');

    const aiConfig = await this.settings.getAIConfig();
    let outreachHandoff;
    try {
      outreachHandoff = await this.outreachAgent.draft(
        context,
        config.systemPrompt ?? aiConfig.systemPrompt,
      );
    } catch (error) {
      const reason =
        error instanceof Error
          ? `AI reply failed: ${error.message}`
          : 'AI reply failed — check Ollama model is installed';
      await this.failWithReview(input, reason, '', 0, lead?.id);
      return { sent: false, reason };
    }

    const outreachDecision = await this.supervisor.evaluate(outreachHandoff);
    const threshold = Math.max(config.confidenceThreshold, aiConfig.autoReplyConfidenceThreshold);

    if (!outreachDecision.approved || outreachHandoff.confidence < threshold) {
      await this.addToReviewQueue.execute({
        chatId: input.chatId,
        leadId: lead?.id,
        prospectMessage: input.messageText,
        draftMessage: outreachHandoff.payload.message,
        reason: 'Low confidence — queued for review',
        confidence: outreachHandoff.confidence,
      });
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
      const reason = 'WhatsApp is not connected — open web.whatsapp.com and refresh';
      await this.failWithReview(
        input,
        reason,
        outreachHandoff.payload.message,
        outreachHandoff.confidence,
        lead?.id,
      );
      return { sent: false, reason };
    }

    const result = await this.whatsapp.send(
      input.chatId,
      outreachHandoff.payload.message,
      sendOpts,
    );
    if (!result.success) {
      const reason = result.error ?? 'Failed to send message';
      await this.failWithReview(
        input,
        reason,
        outreachHandoff.payload.message,
        outreachHandoff.confidence,
        lead?.id,
      );
      return { sent: false, reason };
    }

    await this.messageBus.publish(MessageTypes.AUTO_REPLY_SENT, {
      chatId: input.chatId,
      message: outreachHandoff.payload.message,
    });

    return { sent: true, reason: 'Auto-reply sent' };
  }

  private async resolveEnabledConfig(chatId: string): Promise<AutoReplyConfig | null> {
    const direct = await this.autoReplyRepo.findByChatId(chatId);
    if (direct?.enabled) return direct;

    const lead = await this.resolveLead(chatId);
    if (lead) {
      const byLeadChat = await this.autoReplyRepo.findByChatId(lead.chatId);
      if (byLeadChat?.enabled) return byLeadChat;
    }

    const enabled = await this.autoReplyRepo.findAllEnabled();
    for (const cfg of enabled) {
      if (chatIdsMatch(cfg.chatId, chatId)) return cfg;
      const cfgLead = await this.leadRepo.findByChatId(cfg.chatId);
      if (cfgLead && chatIdsMatch(cfgLead.chatId, chatId)) return cfg;
      if (cfgLead) {
        const phoneKey = cfgLead.phone.replace(/\D/g, '');
        if (phoneKey.length >= 10 && chatId.replace(/\D/g, '') === phoneKey) return cfg;
      }
    }

    return direct;
  }

  private async resolveLead(chatId: string) {
    const direct = await this.leadRepo.findByChatId(chatId);
    if (direct) return direct;

    const leads = await this.leadRepo.findAll();
    return leads.find((lead) => chatIdsMatch(lead.chatId, chatId)) ?? null;
  }

  private async failWithReview(
    input: SendAutoReplyDto,
    reason: string,
    draftMessage: string,
    confidence: number,
    leadId?: string,
  ): Promise<void> {
    await this.addToReviewQueue.execute({
      chatId: input.chatId,
      leadId,
      prospectMessage: input.messageText,
      draftMessage,
      reason,
      confidence,
    });
    await this.messageBus.publish(MessageTypes.AUTO_REPLY_FAILED, {
      chatId: input.chatId,
      reason,
    });
  }
}
