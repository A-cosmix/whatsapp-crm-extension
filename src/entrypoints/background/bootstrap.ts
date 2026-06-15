import { CreateLeadUseCase } from '@application/use-cases/create-lead.use-case';
import { GetLeadsUseCase, UpdateLeadStageUseCase } from '@application/use-cases/lead.use-cases';
import {
  CreateReminderUseCase,
  GetRemindersUseCase,
  HandleReminderAlarmUseCase,
  DismissReminderUseCase,
} from '@application/use-cases/reminder.use-cases';
import { SendAutoReplyUseCase, ToggleAutoReplyUseCase } from '@application/use-cases/auto-reply.use-cases';
import { DexieLeadRepository } from '@infrastructure/storage/dexie-lead-repository';
import { DexieReminderRepository } from '@infrastructure/storage/dexie-reminder-repository';
import { DexieAutoReplyRepository } from '@infrastructure/storage/dexie-auto-reply-repository';
import { ChromeMessageBus } from '@infrastructure/messaging/chrome-message-bus';
import { ChromeAlarmScheduler } from '@infrastructure/scheduling/chrome-alarm-scheduler';
import { ChromeNotifier } from '@infrastructure/notifications/chrome-notifier';
import { ChromeSettingsStore } from '@infrastructure/storage/chrome-settings-store';
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

function generateId(): string {
  return crypto.randomUUID();
}

export interface BackgroundApp {
  createLead: CreateLeadUseCase;
  getLeads: GetLeadsUseCase;
  updateLeadStage: UpdateLeadStageUseCase;
  createReminder: CreateReminderUseCase;
  getReminders: GetRemindersUseCase;
  handleReminderAlarm: HandleReminderAlarmUseCase;
  dismissReminder: DismissReminderUseCase;
  sendAutoReply: SendAutoReplyUseCase;
  toggleAutoReply: ToggleAutoReplyUseCase;
  messageBus: ChromeMessageBus;
  reminderRepo: DexieReminderRepository;
  alarmScheduler: ChromeAlarmScheduler;
}

export function createBackgroundApp(): BackgroundApp {
  const messageBus = new ChromeMessageBus();
  const leadRepo = new DexieLeadRepository();
  const reminderRepo = new DexieReminderRepository();
  const autoReplyRepo = new DexieAutoReplyRepository();
  const alarmScheduler = new ChromeAlarmScheduler();
  const notifier = new ChromeNotifier();
  const settings = new ChromeSettingsStore();
  const whatsapp = new ProxyWhatsAppAdapter();

  const llm = new OllamaProvider('http://localhost:11434');
  const triageAgent = new RuleBasedTriageAgent();
  const outreachAgent = new LLMOutreachAgent(llm, async () => {
    const config = await settings.getAIConfig();
    return config.ollamaModel;
  });
  const supervisor = new SupervisorAgent();

  const createLead = new CreateLeadUseCase(leadRepo, messageBus, generateId);
  const getLeads = new GetLeadsUseCase(leadRepo);
  const updateLeadStage = new UpdateLeadStageUseCase(leadRepo, messageBus);
  const createReminder = new CreateReminderUseCase(reminderRepo, alarmScheduler, messageBus, generateId);
  const getReminders = new GetRemindersUseCase(reminderRepo);
  const handleReminderAlarm = new HandleReminderAlarmUseCase(reminderRepo, notifier, messageBus);
  const dismissReminder = new DismissReminderUseCase(reminderRepo);
  const sendAutoReply = new SendAutoReplyUseCase(
    autoReplyRepo,
    llm,
    whatsapp,
    triageAgent,
    outreachAgent,
    supervisor,
    settings,
    messageBus,
  );
  const toggleAutoReply = new ToggleAutoReplyUseCase(autoReplyRepo);

  return {
    createLead,
    getLeads,
    updateLeadStage,
    createReminder,
    getReminders,
    handleReminderAlarm,
    dismissReminder,
    sendAutoReply,
    toggleAutoReply,
    messageBus,
    reminderRepo,
    alarmScheduler,
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

export async function syncStateToUI(app: BackgroundApp): Promise<void> {
  const leads = await app.getLeads.execute();
  const reminders = await app.getReminders.execute();

  await app.messageBus.publish(MessageTypes.LEADS_SYNC, {
    leads: leads.map(serializeLead),
  });

  await app.messageBus.publish(MessageTypes.REMINDERS_SYNC, {
    reminders: reminders.map(serializeReminder),
  });
}

export async function reRegisterReminders(app: BackgroundApp): Promise<void> {
  const pending = await app.reminderRepo.findPending();
  await app.alarmScheduler.rescheduleAll(
    pending.map((r) => ({ name: `reminder:${r.id}`, when: r.dueAt })),
  );
}

// Debounce map for auto-reply per chat
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
      await app.sendAutoReply.execute(payload);
    } catch (error) {
      console.error('[CRM] Auto-reply failed:', error);
    }
  }, 3500);

  autoReplyDebounce.set(payload.chatId, timer);
}
