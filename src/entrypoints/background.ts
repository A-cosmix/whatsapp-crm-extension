import {
  createBackgroundApp,
  reRegisterAlarms,
  scheduleAutoReply,
  handleAutoReplyAlarm,
  syncStateToUI,
  serializeLead,
  serializeLeadsForUI,
  serializeReminder,
  serializeCampaign,
  serializeReviewItem,
} from './background/bootstrap';
import {
  CreateLeadDtoSchema,
  UpdateLeadStageDtoSchema,
  CreateReminderDtoSchema,
  ToggleAutoReplyDtoSchema,
  CreateCampaignDtoSchema,
  SnoozeReminderDtoSchema,
  UpdateAIConfigDtoSchema,
  UpdateCrmSyncDtoSchema,
} from '@application/dto';
import { MessageTypes } from '@domain/messages';

export default defineBackground(() => {
  const app = createBackgroundApp();

  chrome.runtime.onInstalled.addListener(async () => {
    await reRegisterAlarms(app);
    await syncStateToUI(app);
  });

  chrome.runtime.onStartup.addListener(async () => {
    await reRegisterAlarms(app);
  });

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name.startsWith('reminder:')) {
      const reminderId = alarm.name.replace('reminder:', '');
      await app.handleReminderAlarm.execute(reminderId);
      await syncStateToUI(app);
    } else if (alarm.name.startsWith('campaign:')) {
      const campaignId = alarm.name.replace('campaign:', '');
      await app.executeCampaignStep.execute(campaignId);
      await syncStateToUI(app);
    } else if (alarm.name.startsWith('autoreply:')) {
      const chatId = alarm.name.replace('autoreply:', '');
      await handleAutoReplyAlarm(app, chatId);
    }
  });

  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});

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
        const [leads, reminders, campaigns, reviewQueue, settings] = await Promise.all([
          app.getLeads.execute(),
          app.getReminders.execute(),
          app.getCampaigns.execute(),
          app.getReviewQueue.execute(),
          app.getSettings.execute(),
        ]);
        return {
          leads: await serializeLeadsForUI(leads, app.autoReplyRepo),
          reminders: reminders.map(serializeReminder),
          campaigns: campaigns.map(serializeCampaign),
          reviewQueue: reviewQueue.map(serializeReviewItem),
          settings,
        };
      }

      case 'CREATE_LEAD': {
        const dto = CreateLeadDtoSchema.parse(message.payload);
        const lead = await app.createLead.execute(dto);
        await syncStateToUI(app);
        return lead.toJSON();
      }

      case 'CAPTURE_LEAD_FROM_CHAT': {
        const lead = await app.captureLeadFromChat.execute();
        await syncStateToUI(app);
        return serializeLead(lead);
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

      case 'SNOOZE_REMINDER': {
        const dto = SnoozeReminderDtoSchema.parse(message.payload);
        await app.snoozeReminder.execute(dto.reminderId, dto.snoozeUntil);
        await syncStateToUI(app);
        return { ok: true };
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
        await syncStateToUI(app);
        return config.toJSON();
      }

      case 'CREATE_CAMPAIGN': {
        const dto = CreateCampaignDtoSchema.parse(message.payload);
        const campaign = await app.createCampaign.execute(dto);
        await syncStateToUI(app);
        return serializeCampaign(campaign);
      }

      case 'PAUSE_CAMPAIGN': {
        const { campaignId } = message.payload as { campaignId: string };
        await app.pauseCampaign.execute(campaignId);
        await syncStateToUI(app);
        return { ok: true };
      }

      case 'CANCEL_CAMPAIGN': {
        const { campaignId } = message.payload as { campaignId: string };
        await app.cancelCampaign.execute(campaignId);
        await syncStateToUI(app);
        return { ok: true };
      }

      case 'RESUME_CAMPAIGN': {
        const { campaignId } = message.payload as { campaignId: string };
        await app.resumeCampaign.execute(campaignId);
        await syncStateToUI(app);
        return { ok: true };
      }

      case 'APPROVE_REVIEW': {
        const { itemId } = message.payload as { itemId: string };
        await app.approveReviewItem.execute(itemId);
        await syncStateToUI(app);
        return { ok: true };
      }

      case 'REJECT_REVIEW': {
        const { itemId } = message.payload as { itemId: string };
        await app.rejectReviewItem.execute(itemId);
        await syncStateToUI(app);
        return { ok: true };
      }

      case 'UPDATE_AI_CONFIG': {
        const dto = UpdateAIConfigDtoSchema.parse(message.payload);
        return app.updateAIConfig.execute(dto);
      }

      case 'UPDATE_CRM_SYNC': {
        const dto = UpdateCrmSyncDtoSchema.parse(message.payload);
        return app.updateCrmSync.execute(dto);
      }

      case MessageTypes.MESSAGE_RECEIVED: {
        const payload = message.payload as {
          chatId: string;
          messageText?: string;
          text?: string;
          messageId: string;
          timestamp: number;
          isGroup: boolean;
        };
        await scheduleAutoReply(app, payload);
        return { queued: true };
      }

      default:
        return null;
    }
  }
});
