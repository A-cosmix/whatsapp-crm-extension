import type { AutoReplyConfig } from '../entities/auto-reply-config';

export interface IAutoReplyRepository {
  findByChatId(chatId: string): Promise<AutoReplyConfig | null>;
  save(config: AutoReplyConfig): Promise<void>;
  findAllEnabled(): Promise<AutoReplyConfig[]>;
}
