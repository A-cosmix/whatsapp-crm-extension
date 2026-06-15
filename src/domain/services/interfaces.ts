export interface ConversationMessage {
  id: string;
  chatId: string;
  role: 'prospect' | 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ContactInfo {
  chatId: string;
  phone: string;
  name: string;
  isGroup: boolean;
}

export interface IMessageSender {
  send(chatId: string, text: string): Promise<SendResult>;
}

export interface IMessageReader {
  getRecentMessages(chatId: string, limit: number): Promise<ConversationMessage[]>;
}

export interface IContactReader {
  getContactInfo(chatId: string): Promise<ContactInfo | null>;
  getActiveChatId(): Promise<string | null>;
}

export interface IWhatsAppAdapter extends IMessageSender, IMessageReader, IContactReader {
  isConnected(): Promise<boolean>;
}

export interface LLMRequest {
  model: string;
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ILLMProvider {
  readonly id: string;
  generate(request: LLMRequest): AsyncIterable<string>;
  embed(text: string): Promise<number[]>;
  isAvailable(): Promise<boolean>;
}

export interface IMessageBus {
  publish<T>(type: string, payload: T): Promise<void>;
  subscribe<T>(type: string, handler: (payload: T) => void): void;
}
