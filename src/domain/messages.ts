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
  WHATSAPP_ACTION: 'WHATSAPP_ACTION',
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
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
  action: 'send' | 'getMessages' | 'getActiveChat' | 'getContact' | 'isConnected';
  chatId?: string;
  text?: string;
  limit?: number;
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
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'ollama',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3.2:3b',
  autoReplyConfidenceThreshold: 0.75,
  maxTokensPerRequest: 500,
  systemPrompt:
    'You are a helpful sales assistant. Reply concisely in the same language as the customer (Hindi, English, or Hinglish). Be professional and friendly.',
};
