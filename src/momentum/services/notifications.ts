import { getSettings } from './storage';

export async function showNotification(
  title: string,
  message: string,
  options?: { id?: string; requireInteraction?: boolean },
): Promise<void> {
  const settings = await getSettings();
  if (!settings.notificationsEnabled) return;

  await chrome.notifications.create(options?.id ?? `mx-${Date.now()}`, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icon/128.png'),
    title,
    message,
    priority: 2,
    requireInteraction: options?.requireInteraction ?? false,
  });
}

export async function scheduleReminderNotification(
  id: string,
  title: string,
  body: string,
  scheduledAt: number,
): Promise<void> {
  const delay = scheduledAt - Date.now();
  if (delay <= 0) {
    await showNotification(title, body, { id: `reminder-${id}` });
    return;
  }

  await chrome.alarms.create(`reminder:${id}`, { when: scheduledAt });
}
