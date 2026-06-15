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

export interface SendMessageOptions {
  phone?: string;
  name?: string;
}

export interface IMessageSender {
  send(chatId: string, text: string, options?: SendMessageOptions): Promise<SendResult>;
}

export interface IMessageReader {
  getRecentMessages(chatId: string, limit: number, options?: SendMessageOptions): Promise<ConversationMessage[]>;
}

export interface IContactReader {
  getContactInfo(chatId: string): Promise<ContactInfo | null>;
  getActiveChatId(): Promise<string | null>;
  scrapePhone(): Promise<string>;
}

export interface IWhatsAppAdapter extends IMessageSender, IMessageReader, IContactReader {
  isConnected(): Promise<boolean>;
  openChat(options: SendMessageOptions & { chatId?: string }): Promise<void>;
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
