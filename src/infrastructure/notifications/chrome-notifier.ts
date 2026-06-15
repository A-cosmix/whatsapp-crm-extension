export class ChromeNotifier {
  constructor() {
    chrome.notifications.onClicked.addListener(() => {
      chrome.tabs.create({ url: 'https://web.whatsapp.com' });
    });
  }

  async show(title: string, message: string): Promise<void> {
    const iconUrl = chrome.runtime.getURL('icon/128.png');
    await chrome.notifications.create(`crm-${Date.now()}`, {
      type: 'basic',
      iconUrl,
      title,
      message,
    });
  }
}
