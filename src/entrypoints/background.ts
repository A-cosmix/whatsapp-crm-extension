import {
  handleContextMenuClick,
  handleRuntimeMessage,
  setupContextMenus,
} from '../momentum/background/message-handler';
import { getSettings, getTimer, saveTimer } from '../momentum/services/storage';
import { showNotification } from '../momentum/services/notifications';
import { getReminders, saveReminders } from '../momentum/services/storage';

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(async (details) => {
    await setupContextMenus();

    if (details.reason === 'install') {
      const settings = await getSettings();
      if (!settings.onboardingComplete) {
        chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') });
      }
    }
  });

  chrome.runtime.onStartup.addListener(async () => {
    await setupContextMenus();
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    handleContextMenuClick(info, tab).catch(console.error);
  });

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name.startsWith('reminder:')) {
      const id = alarm.name.replace('reminder:', '');
      const reminders = await getReminders();
      const reminder = reminders.find((r) => r.id === id);
      if (!reminder || reminder.completed) return;

      await showNotification(reminder.title, reminder.body, {
        id: `reminder-${id}`,
        requireInteraction: true,
      });

      await saveReminders(
        reminders.map((r) => (r.id === id ? { ...r, completed: true } : r)),
      );
      return;
    }

    if (alarm.name === 'mx-timer-tick') {
      const timer = await getTimer();
      if (!timer.isRunning || !timer.startedAt) return;

      const settings = await getSettings();
      const total = (timer.isBreak ? settings.breakDuration : settings.focusDuration) * 60;
      const elapsed = Math.floor((Date.now() - timer.startedAt) / 1000);
      const remaining = Math.max(0, total - elapsed);

      if (remaining !== timer.remaining) {
        const updated = { ...timer, remaining };
        if (remaining === 0) {
          updated.isRunning = false;
          updated.startedAt = null;
          await handleRuntimeMessage({
            type: 'MX_UPDATE_TIMER',
            payload: updated,
          });
        } else {
          await saveTimer(updated);
        }
      }
    }
  });

  chrome.alarms.create('mx-timer-tick', { periodInMinutes: 1 });

  chrome.commands.onCommand.addListener(async (command) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    switch (command) {
      case 'open-sidebar':
        await chrome.sidePanel.open({ tabId: tab.id });
        break;
      case 'summarize-page':
        chrome.tabs.sendMessage(tab.id, { type: 'MX_TRIGGER_PAGE_SUMMARY' });
        break;
      case 'quick-note':
        chrome.tabs.sendMessage(tab.id, { type: 'MX_QUICK_NOTE' });
        break;
      case 'toggle-timer': {
        const timer = await getTimer();
        const settings = await getSettings();
        if (timer.isRunning) {
          await handleRuntimeMessage({
            type: 'MX_UPDATE_TIMER',
            payload: { ...timer, isRunning: false, startedAt: null },
          });
        } else {
          const duration = (timer.isBreak ? settings.breakDuration : settings.focusDuration) * 60;
          await handleRuntimeMessage({
            type: 'MX_UPDATE_TIMER',
            payload: { ...timer, isRunning: true, remaining: duration, startedAt: Date.now() },
          });
        }
        break;
      }
    }
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    handleRuntimeMessage(message)
      .then((data) => sendResponse({ success: true, data }))
      .catch((error) =>
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
      );
    return true;
  });
});
