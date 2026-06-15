import type { IAutoReplyRepository } from '@domain/repositories/auto-reply.repository';
import { AutoReplyConfig } from '@domain/entities/auto-reply-config';
import { getDatabase } from './dexie-storage';

export class DexieAutoReplyRepository implements IAutoReplyRepository {
  async findByChatId(chatId: string): Promise<AutoReplyConfig | null> {
    const row = await getDatabase().autoReplyConfigs.get(chatId);
    return row ? AutoReplyConfig.reconstitute(row) : null;
  }

  async save(config: AutoReplyConfig): Promise<void> {
    await getDatabase().autoReplyConfigs.put(config.toJSON());
  }

  async findAllEnabled(): Promise<AutoReplyConfig[]> {
    const rows = await getDatabase().autoReplyConfigs.filter((c) => c.enabled).toArray();
    return rows.map((r) => AutoReplyConfig.reconstitute(r));
  }
}
