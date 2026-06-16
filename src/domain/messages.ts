export const MessageTypes = {
  LEAD_CREATED: 'LEAD_CREATED',
  LEAD_UPDATED: 'LEAD_UPDATED',
  LEADS_SYNC: 'LEADS_SYNC',
  REMINDER_CREATED: 'REMINDER_CREATED',
  REMINDER_FIRED: 'REMINDER_FIRED',
  REMINDERS_SYNC: 'REMINDERS_SYNC',
  MESSAGE_RECEIVED: 'MESSAGE_RECEIVED',
  AUTO_REPLY_SENT: 'AUTO_REPLY_SENT',
  AUTO_REPLY_QUEUED: 'AUTO_REPLY_QUEUED',
  AUTO_REPLY_FAILED: 'AUTO_REPLY_FAILED',
  WHATSAPP_ACTION: 'WHATSAPP_ACTION',
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
  CAMPAIGNS_SYNC: 'CAMPAIGNS_SYNC',
  REVIEW_QUEUE_SYNC: 'REVIEW_QUEUE_SYNC',
  CHAT_OPENED: 'CHAT_OPENED',
} as const;

export type MessageType = (typeof MessageTypes)[keyof typeof MessageTypes];

export interface LeadCreatedPayload {
  leadId: string;
}

export interface LeadUpdatedPayload {
  leadId: string;
}

export interface LeadsSyncPayload {
  leads: Array<{
    id: string;
    phone: string;
    name: string;
    stage: string;
    chatId: string;
    tags: string[];
    updatedAt: number;
    autoReplyEnabled?: boolean;
  }>;
}

export interface ReminderCreatedPayload {
  reminderId: string;
}

export interface RemindersSyncPayload {
  reminders: Array<{
    id: string;
    leadId: string;
    title: string;
    dueAt: number;
    status: string;
  }>;
}

export interface MessageReceivedPayload {
  chatId: string;
  text: string;
  messageId: string;
  timestamp: number;
  isGroup: boolean;
}

export interface WhatsAppActionRequest {
  action:
    | 'send'
    | 'getMessages'
    | 'getActiveChat'
    | 'getContact'
    | 'isConnected'
    | 'openChat'
    | 'scrapePhone';
  chatId?: string;
  text?: string;
  limit?: number;
  phone?: string;
  name?: string;
}

export interface WhatsAppActionResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface AIConfig {
  provider: 'ollama' | 'webllm' | 'cloud';
  ollamaUrl: string;
  ollamaModel: string;
  autoReplyConfidenceThreshold: number;
  maxTokensPerRequest: number;
  systemPrompt: string;
  dailyBulkCap: number;
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'ollama',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3.2:3b',
  autoReplyConfidenceThreshold: 0.75,
  maxTokensPerRequest: 500,
  systemPrompt:
    'You are a helpful sales assistant. Reply concisely in the same language as the customer (Hindi, English, or Hinglish). Be professional and friendly.',
  dailyBulkCap: 50,
};
