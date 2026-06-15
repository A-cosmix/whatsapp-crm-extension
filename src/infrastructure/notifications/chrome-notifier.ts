import type { INotifier } from '@domain/services/platform.interfaces';

export class ChromeNotifier implements INotifier {
  async show(title: string, message: string): Promise<void> {
    const iconUrl = chrome.runtime.getURL('icon/128.png');
    await chrome.notifications.create({
      type: 'basic',
      iconUrl,
      title,
      message,
    });
  }
}
