import { CreateLeadUseCase } from '@application/use-cases/create-lead.use-case';
import { CaptureLeadFromChatUseCase } from '@application/use-cases/capture-lead-from-chat.use-case';
import { GetLeadsUseCase, UpdateLeadStageUseCase } from '@application/use-cases/lead.use-cases';
import {
  CreateReminderUseCase,
  GetRemindersUseCase,
  HandleReminderAlarmUseCase,
  DismissReminderUseCase,
  SnoozeReminderUseCase,
} from '@application/use-cases/reminder.use-cases';
import { SendAutoReplyUseCase, ToggleAutoReplyUseCase } from '@application/use-cases/auto-reply.use-cases';
import {
  CreateCampaignUseCase,
  GetCampaignsUseCase,
  PauseCampaignUseCase,
  CancelCampaignUseCase,
  ExecuteCampaignStepUseCase,
} from '@application/use-cases/campaign.use-cases';
import {
  GetReviewQueueUseCase,
  AddToReviewQueueUseCase,
  ApproveReviewItemUseCase,
  RejectReviewItemUseCase,
} from '@application/use-cases/review-queue.use-cases';
import {
  GetSettingsUseCase,
  UpdateAIConfigUseCase,
  UpdateCrmSyncUseCase,
} from '@application/use-cases/settings.use-cases';
import { DexieLeadRepository } from '@infrastructure/storage/dexie-lead-repository';
import { DexieReminderRepository } from '@infrastructure/storage/dexie-reminder-repository';
import { DexieAutoReplyRepository } from '@infrastructure/storage/dexie-auto-reply-repository';
import { DexieCampaignRepository } from '@infrastructure/storage/dexie-campaign-repository';
import { DexieCampaignRecipientRepository } from '@infrastructure/storage/dexie-campaign-recipient-repository';
import { DexieReviewQueueRepository } from '@infrastructure/storage/dexie-review-queue-repository';
import { ChromeMessageBus } from '@infrastructure/messaging/chrome-message-bus';
import { ChromeAlarmScheduler } from '@infrastructure/scheduling/chrome-alarm-scheduler';
import { ChromeDailySendTracker } from '@infrastructure/scheduling/daily-send-tracker';
import { ChromeNotifier } from '@infrastructure/notifications/chrome-notifier';
import { ChromeSettingsStore } from '@infrastructure/storage/chrome-settings-store';
import { WebhookCrmSyncService } from '@infrastructure/crm/webhook-crm-sync';
import { OllamaProvider } from '@infrastructure/llm/ollama-provider';
import { ProxyWhatsAppAdapter } from '@infrastructure/whatsapp/proxy-whatsapp-adapter';
import {
  RuleBasedTriageAgent,
  LLMOutreachAgent,
  SupervisorAgent,
} from '@infrastructure/agents/crm-agents';
import { MessageTypes } from '@domain/messages';
import type { Lead } from '@domain/entities/lead';
import type { Reminder } from '@domain/entities/reminder';
import type { Campaign } from '@domain/entities/campaign';
import type { ReviewQueueItem } from '@domain/entities/review-queue-item';

function generateId(): string {
  return crypto.randomUUID();
}

export interface BackgroundApp {
  createLead: CreateLeadUseCase;
  captureLeadFromChat: CaptureLeadFromChatUseCase;
  getLeads: GetLeadsUseCase;
  updateLeadStage: UpdateLeadStageUseCase;
  createReminder: CreateReminderUseCase;
  getReminders: GetRemindersUseCase;
  handleReminderAlarm: HandleReminderAlarmUseCase;
  dismissReminder: DismissReminderUseCase;
  snoozeReminder: SnoozeReminderUseCase;
  sendAutoReply: SendAutoReplyUseCase;
  toggleAutoReply: ToggleAutoReplyUseCase;
  createCampaign: CreateCampaignUseCase;
  getCampaigns: GetCampaignsUseCase;
  pauseCampaign: PauseCampaignUseCase;
  cancelCampaign: CancelCampaignUseCase;
  executeCampaignStep: ExecuteCampaignStepUseCase;
  getReviewQueue: GetReviewQueueUseCase;
  approveReviewItem: ApproveReviewItemUseCase;
  rejectReviewItem: RejectReviewItemUseCase;
  getSettings: GetSettingsUseCase;
  updateAIConfig: UpdateAIConfigUseCase;
  updateCrmSync: UpdateCrmSyncUseCase;
  messageBus: ChromeMessageBus;
  reminderRepo: DexieReminderRepository;
  campaignRepo: DexieCampaignRepository;
  alarmScheduler: ChromeAlarmScheduler;
  settings: ChromeSettingsStore;
}

export function createBackgroundApp(): BackgroundApp {
  const messageBus = new ChromeMessageBus();
  const settings = new ChromeSettingsStore();
  const leadRepo = new DexieLeadRepository();
  const reminderRepo = new DexieReminderRepository();
  const autoReplyRepo = new DexieAutoReplyRepository();
  const campaignRepo = new DexieCampaignRepository();
  const recipientRepo = new DexieCampaignRecipientRepository();
  const reviewRepo = new DexieReviewQueueRepository();
  const alarmScheduler = new ChromeAlarmScheduler();
  const notifier = new ChromeNotifier();
  const whatsapp = new ProxyWhatsAppAdapter();
  const crmSync = new WebhookCrmSyncService(settings);
  const dailyTracker = new ChromeDailySendTracker(settings);

  const llm = new OllamaProvider('http://localhost:11434');
  const triageAgent = new RuleBasedTriageAgent();
  const outreachAgent = new LLMOutreachAgent(llm, async () => {
    const config = await settings.getAIConfig();
    return config.ollamaModel;
  });
  const supervisor = new SupervisorAgent();

  const addToReviewQueue = new AddToReviewQueueUseCase(reviewRepo, messageBus, generateId);

  const createLead = new CreateLeadUseCase(leadRepo, messageBus, generateId);
  const captureLeadFromChat = new CaptureLeadFromChatUseCase(
    leadRepo,
    whatsapp,
    messageBus,
    crmSync,
    generateId,
  );
  const getLeads = new GetLeadsUseCase(leadRepo);
  const updateLeadStage = new UpdateLeadStageUseCase(leadRepo, messageBus);
  const createReminder = new CreateReminderUseCase(reminderRepo, alarmScheduler, messageBus, generateId);
  const getReminders = new GetRemindersUseCase(reminderRepo);
  const handleReminderAlarm = new HandleReminderAlarmUseCase(reminderRepo, notifier, messageBus);
  const dismissReminder = new DismissReminderUseCase(reminderRepo);
  const snoozeReminder = new SnoozeReminderUseCase(reminderRepo, alarmScheduler);
  const sendAutoReply = new SendAutoReplyUseCase(
    autoReplyRepo,
    llm,
    whatsapp,
    triageAgent,
    outreachAgent,
    supervisor,
    settings,
    messageBus,
    addToReviewQueue,
  );
  const toggleAutoReply = new ToggleAutoReplyUseCase(autoReplyRepo);
  const createCampaign = new CreateCampaignUseCase(
    campaignRepo,
    recipientRepo,
    leadRepo,
    alarmScheduler,
    messageBus,
    generateId,
  );
  const getCampaigns = new GetCampaignsUseCase(campaignRepo);
  const pauseCampaign = new PauseCampaignUseCase(campaignRepo);
  const cancelCampaign = new CancelCampaignUseCase(campaignRepo, alarmScheduler);
  const executeCampaignStep = new ExecuteCampaignStepUseCase(
    campaignRepo,
    recipientRepo,
    whatsapp,
    dailyTracker,
    alarmScheduler,
    messageBus,
  );
  const getReviewQueue = new GetReviewQueueUseCase(reviewRepo);
  const approveReviewItem = new ApproveReviewItemUseCase(reviewRepo, whatsapp, messageBus);
  const rejectReviewItem = new RejectReviewItemUseCase(reviewRepo);
  const getSettings = new GetSettingsUseCase(settings);
  const updateAIConfig = new UpdateAIConfigUseCase(settings, messageBus);
  const updateCrmSync = new UpdateCrmSyncUseCase(settings, messageBus);

  return {
    createLead,
    captureLeadFromChat,
    getLeads,
    updateLeadStage,
    createReminder,
    getReminders,
    handleReminderAlarm,
    dismissReminder,
    snoozeReminder,
    sendAutoReply,
    toggleAutoReply,
    createCampaign,
    getCampaigns,
    pauseCampaign,
    cancelCampaign,
    executeCampaignStep,
    getReviewQueue,
    approveReviewItem,
    rejectReviewItem,
    getSettings,
    updateAIConfig,
    updateCrmSync,
    messageBus,
    reminderRepo,
    campaignRepo,
    alarmScheduler,
    settings,
  };
}

export function serializeLead(lead: Lead) {
  const json = lead.toJSON();
  return {
    id: json.id,
    phone: json.phone,
    name: json.name,
    stage: json.stage,
    chatId: json.chatId,
    tags: json.tags,
    updatedAt: json.updatedAt,
    score: json.score,
  };
}

export function serializeReminder(reminder: Reminder) {
  const json = reminder.toJSON();
  return {
    id: json.id,
    leadId: json.leadId,
    title: json.title,
    dueAt: json.dueAt,
    status: json.status,
    chatId: json.chatId,
  };
}

export function serializeCampaign(campaign: Campaign) {
  const json = campaign.toJSON();
  return {
    id: json.id,
    name: json.name,
    template: json.template,
    status: json.status,
    sentCount: json.sentCount,
    failedCount: json.failedCount,
    createdAt: json.createdAt,
    dailyCap: json.dailyCap,
  };
}

export function serializeReviewItem(item: ReviewQueueItem) {
  const json = item.toJSON();
  return {
    id: json.id,
    chatId: json.chatId,
    prospectMessage: json.prospectMessage,
    draftMessage: json.draftMessage,
    reason: json.reason,
    confidence: json.confidence,
    status: json.status,
    createdAt: json.createdAt,
  };
}

export async function syncStateToUI(app: BackgroundApp): Promise<void> {
  const [leads, reminders, campaigns, reviewQueue] = await Promise.all([
    app.getLeads.execute(),
    app.getReminders.execute(),
    app.getCampaigns.execute(),
    app.getReviewQueue.execute(),
  ]);

  await app.messageBus.publish(MessageTypes.LEADS_SYNC, {
    leads: leads.map(serializeLead),
  });
  await app.messageBus.publish(MessageTypes.REMINDERS_SYNC, {
    reminders: reminders.map(serializeReminder),
  });
  await app.messageBus.publish(MessageTypes.CAMPAIGNS_SYNC, {
    campaigns: campaigns.map(serializeCampaign),
  });
  await app.messageBus.publish(MessageTypes.REVIEW_QUEUE_SYNC, {
    items: reviewQueue.map(serializeReviewItem),
  });
}

export async function reRegisterAlarms(app: BackgroundApp): Promise<void> {
  const pending = await app.reminderRepo.findPending();
  await app.alarmScheduler.rescheduleAll(
    pending.map((r) => ({ name: `reminder:${r.id}`, when: r.dueAt })),
  );

  const running = await app.campaignRepo.findByStatus('running');
  for (const campaign of running) {
    await app.alarmScheduler.schedule(`campaign:${campaign.id}`, Date.now() + 5000);
  }
}

const autoReplyDebounce = new Map<string, ReturnType<typeof setTimeout>>();

export function scheduleAutoReply(
  app: BackgroundApp,
  payload: {
    chatId: string;
    text: string;
    messageId: string;
    isGroup: boolean;
  },
): void {
  const existing = autoReplyDebounce.get(payload.chatId);
  if (existing) clearTimeout(existing);

  const timer = setTimeout(async () => {
    autoReplyDebounce.delete(payload.chatId);
    try {
      const result = await app.sendAutoReply.execute(payload);
      if (result.sent) {
        await syncStateToUI(app);
      }
    } catch (error) {
      console.error('[CRM] Auto-reply failed:', error);
    }
  }, 3500);

  autoReplyDebounce.set(payload.chatId, timer);
}
