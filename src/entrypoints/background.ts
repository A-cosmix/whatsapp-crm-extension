import { handleMessage } from '@infrastructure/di/container';
import type { ExtensionMessage } from '@infrastructure/di/container';

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
    handleMessage(message)
      .then(sendResponse)
      .catch((error: Error) => sendResponse({ error: error.message }));
    return true;
  });

  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    }
  });

  chrome.alarms.create('hiremate-daily-reminder', { periodInMinutes: 1440 });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'hiremate-daily-reminder') {
      chrome.notifications.create('hiremate-reminder', {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icon/128.png'),
        title: 'HireMate AI',
        message: 'Keep your job search momentum! Check your tracker and apply to new roles today.',
      });
    }
  });
});
