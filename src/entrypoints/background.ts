import {
  createBackgroundApp,
  reRegisterReminders,
  scheduleAutoReply,
  syncStateToUI,
  serializeLead,
  serializeReminder,
} from './background/bootstrap';
import {
  CreateLeadDtoSchema,
  UpdateLeadStageDtoSchema,
  CreateReminderDtoSchema,
  ToggleAutoReplyDtoSchema,
} from '@application/dto';
import { MessageTypes } from '@domain/messages';

export default defineBackground(() => {
  const app = createBackgroundApp();

  chrome.runtime.onInstalled.addListener(async () => {
    await reRegisterReminders(app);
    await syncStateToUI(app);
  });

  chrome.runtime.onStartup.addListener(async () => {
    await reRegisterReminders(app);
  });

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name.startsWith('reminder:')) {
      const reminderId = alarm.name.replace('reminder:', '');
      await app.handleReminderAlarm.execute(reminderId);
      await syncStateToUI(app);
    }
  });

  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {
    // sidePanel may not be available in all contexts during dev
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    handleMessage(message)
      .then((result) => sendResponse({ success: true, data: result }))
      .catch((error) =>
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
      );
    return true;
  });

  async function handleMessage(message: { type: string; payload?: unknown }) {
    switch (message.type) {
      case 'GET_STATE': {
        const leads = await app.getLeads.execute();
        const reminders = await app.getReminders.execute();
        return {
          leads: leads.map(serializeLead),
          reminders: reminders.map(serializeReminder),
        };
      }

      case 'CREATE_LEAD': {
        const dto = CreateLeadDtoSchema.parse(message.payload);
        const lead = await app.createLead.execute(dto);
        await syncStateToUI(app);
        return lead.toJSON();
      }

      case 'UPDATE_LEAD_STAGE': {
        const dto = UpdateLeadStageDtoSchema.parse(message.payload);
        const lead = await app.updateLeadStage.execute(dto);
        await syncStateToUI(app);
        return lead.toJSON();
      }

      case 'CREATE_REMINDER': {
        const dto = CreateReminderDtoSchema.parse(message.payload);
        const reminder = await app.createReminder.execute(dto);
        await syncStateToUI(app);
        return reminder.toJSON();
      }

      case 'DISMISS_REMINDER': {
        const { reminderId } = message.payload as { reminderId: string };
        await app.dismissReminder.execute(reminderId);
        await syncStateToUI(app);
        return { ok: true };
      }

      case 'TOGGLE_AUTO_REPLY': {
        const dto = ToggleAutoReplyDtoSchema.parse(message.payload);
        const config = await app.toggleAutoReply.execute(dto);
        return config.toJSON();
      }

      case MessageTypes.MESSAGE_RECEIVED: {
        const payload = message.payload as {
          chatId: string;
          text: string;
          messageId: string;
          timestamp: number;
          isGroup: boolean;
        };
        scheduleAutoReply(app, payload);
        return { queued: true };
      }

      default:
        return null;
    }
  }
});
