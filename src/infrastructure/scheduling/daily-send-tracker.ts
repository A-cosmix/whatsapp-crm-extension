import type { IDailySendTracker } from '@domain/services/crm-sync.interface';
import type { ISettingsStore } from '@domain/services/platform.interfaces';

const DAILY_COUNT_KEY = 'daily_send_count';

interface DailyCount {
  date: string;
  count: number;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export class ChromeDailySendTracker implements IDailySendTracker {
  constructor(private readonly settings: ISettingsStore) {}

  async getTodayCount(): Promise<number> {
    const stored = await this.getStored();
    return stored.date === todayKey() ? stored.count : 0;
  }

  async increment(): Promise<number> {
    const stored = await this.getStored();
    const count = stored.date === todayKey() ? stored.count + 1 : 1;
    await chrome.storage.local.set({
      [DAILY_COUNT_KEY]: { date: todayKey(), count } satisfies DailyCount,
    });
    return count;
  }

  async getDailyCap(): Promise<number> {
    const config = await this.settings.getAIConfig();
    return config.dailyBulkCap;
  }

  private async getStored(): Promise<DailyCount> {
    const result = await chrome.storage.local.get(DAILY_COUNT_KEY);
    return (result[DAILY_COUNT_KEY] as DailyCount | undefined) ?? { date: todayKey(), count: 0 };
  }
}
