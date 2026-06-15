import type { IAlarmScheduler } from '@domain/services/platform.interfaces';

export class ChromeAlarmScheduler implements IAlarmScheduler {
  async schedule(name: string, when: number): Promise<void> {
    await chrome.alarms.create(name, { when });
  }

  async cancel(name: string): Promise<void> {
    await chrome.alarms.clear(name);
  }

  async rescheduleAll(pending: Array<{ name: string; when: number }>): Promise<void> {
    const existing = await chrome.alarms.getAll();
    for (const alarm of existing) {
      if (alarm.name.startsWith('reminder:')) {
        await chrome.alarms.clear(alarm.name);
      }
    }

    const now = Date.now();
    for (const item of pending) {
      if (item.when > now) {
        await this.schedule(item.name, item.when);
      }
    }
  }
}
