import type { ExtensionMessage, ExplainTextPayload, ExplainWordPayload, GenerateNotesPayload, YouTubeSummaryPayload, PdfSummaryPayload } from '@/types';
import { EXPLANATION_MODES } from '@/types';
import {
  buildExplainPrompt,
  buildWordPrompt,
  buildNotesPrompt,
  buildYouTubePrompt,
  buildPdfPrompt,
} from '@/lib/prompts';
import { explainText, explainWord, generateNotes, summarizeContent, hashText } from '@/services/ai/claude-service';
import {
  cacheExplanation,
  getCachedExplanation,
  saveNote,
  getLocalProfile,
  saveLocalProfile,
  clearExpiredCache,
  saveDailyReport,
  getDailyReport,
} from '@/services/storage/indexed-db';
import { trackAnalytics, incrementMetric } from '@/services/analytics/tracker';
import {
  getUserProfile,
  incrementUsage,
  canUseFeature,
  saveExplanationHistory,
  getSubscriptionStatus,
} from '@/services/auth/firebase-auth';
import { verifyPayment } from '@/services/payments/razorpay';
import type { ExplanationRecord, DailyLearningReport } from '@/types';

async function handleExplainText(payload: ExplainTextPayload) {
  const { text, mode, url, pageTitle } = payload;
  const cacheId = hashText(`${text}_${mode}`);
  const cached = await getCachedExplanation(cacheId);
  if (cached) return { success: true, explanation: cached.explanation, cached: true };

  const profile = await getLocalProfile();
  const modeConfig = EXPLANATION_MODES.find((m) => m.id === mode);
  const usageCheck = canUseFeature(profile as never, modeConfig?.isPremium);
  if (!usageCheck.allowed) return { success: false, error: usageCheck.reason };

  const prompt = buildExplainPrompt(text, mode);
  const explanation = await explainText(prompt);

  const record: ExplanationRecord = {
    id: cacheId,
    originalText: text,
    explanation,
    mode,
    url,
    pageTitle,
    timestamp: Date.now(),
    cached: true,
  };
  await cacheExplanation(record);

  if (profile?.uid) {
    await incrementUsage(profile.uid as string);
    await saveExplanationHistory(profile.uid as string, { originalText: text, explanation, mode, url, pageTitle });
    const updated = await getUserProfile(profile.uid as string);
    if (updated) await saveLocalProfile(updated as unknown as Record<string, unknown>);
  }

  await incrementMetric(mode);
  await trackAnalytics('explanation_generated', { mode, url: url.slice(0, 100) }, profile?.uid as string);
  await updateDailyReport(mode, url, pageTitle);

  return { success: true, explanation, cached: false };
}

async function handleExplainWord(payload: ExplainWordPayload) {
  const prompt = buildWordPrompt(payload.word, payload.context);
  const result = await explainWord(prompt);
  await trackAnalytics('word_explained', { word: payload.word });
  return { success: true, ...result };
}

async function handleGenerateNotes(payload: GenerateNotesPayload) {
  const profile = await getLocalProfile();
  const usageCheck = canUseFeature(profile as never, true);
  if (!usageCheck.allowed) return { success: false, error: usageCheck.reason };

  const prompt = buildNotesPrompt(payload.content, payload.type);
  const content = await generateNotes(prompt);

  const note = {
    id: `note_${Date.now()}`,
    title: payload.title,
    content,
    sourceUrl: payload.url,
    type: payload.type,
    createdAt: Date.now(),
  };
  await saveNote(note);
  await trackAnalytics('notes_generated', { type: payload.type });
  return { success: true, note };
}

async function handleYouTubeSummary(payload: YouTubeSummaryPayload) {
  const profile = await getLocalProfile();
  const usageCheck = canUseFeature(profile as never, true);
  if (!usageCheck.allowed) return { success: false, error: usageCheck.reason };

  const prompt = buildYouTubePrompt(payload.videoTitle, payload.transcript || '', payload.mode);
  const summary = await summarizeContent(prompt);
  await trackAnalytics('youtube_summarized', { title: payload.videoTitle });
  return { success: true, summary };
}

async function handlePdfSummary(payload: PdfSummaryPayload) {
  const profile = await getLocalProfile();
  const usageCheck = canUseFeature(profile as never, true);
  if (!usageCheck.allowed) return { success: false, error: usageCheck.reason };

  const prompt = buildPdfPrompt(payload.text, payload.mode, payload.action);
  const result = await summarizeContent(prompt);
  await trackAnalytics('pdf_summarized', { action: payload.action });
  return { success: true, result };
}

async function updateDailyReport(mode: string, url: string, pageTitle: string) {
  const today = new Date().toISOString().split('T')[0];
  const existing = await getDailyReport(today);
  const report: DailyLearningReport = existing || {
    date: today,
    topicsLearned: [],
    websitesVisited: [],
    explanationsCount: 0,
    modesUsed: {},
    streak: 0,
  };

  report.explanationsCount++;
  report.modesUsed[mode] = (report.modesUsed[mode] || 0) + 1;
  if (!report.websitesVisited.includes(url)) report.websitesVisited.push(url);
  if (pageTitle && !report.topicsLearned.includes(pageTitle)) {
    report.topicsLearned.push(pageTitle.slice(0, 100));
  }

  await saveDailyReport(report);
}

chrome.runtime.onInstalled.addListener(async (details) => {
  chrome.contextMenus.create({
    id: 'explain-selection',
    title: '💬 Explain Like WhatsApp',
    contexts: ['selection'],
  });

  if (details.reason === 'install') {
    await chrome.storage.local.set({
      installDate: Date.now(),
      onboardingComplete: false,
    });
    chrome.tabs.create({ url: chrome.runtime.getURL('src/popup/index.html') });
  }

  await clearExpiredCache();
  chrome.alarms.create('cache-cleanup', { periodInMinutes: 1440 });
  chrome.alarms.create('daily-report', { periodInMinutes: 1440 });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'explain-selection' && info.selectionText && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'TRIGGER_EXPLAIN',
      payload: { text: info.selectionText },
    });
  }
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === 'explain-selection' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'TRIGGER_EXPLAIN_SHORTCUT' });
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'cache-cleanup') await clearExpiredCache();
  if (alarm.name === 'daily-report') await sendDailyReportNotification();
  if (alarm.name === 'renewal-reminder') await sendRenewalReminder();
});

async function sendDailyReportNotification() {
  const today = new Date().toISOString().split('T')[0];
  const report = await getDailyReport(today);
  if (!report || report.explanationsCount === 0) return;

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'public/icon/128.png',
    title: '📚 Your Daily Learning Report',
    message: `You learned ${report.explanationsCount} things today! Topics: ${report.topicsLearned.slice(0, 3).join(', ')}`,
  });
}

async function sendRenewalReminder() {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'public/icon/128.png',
    title: '⏰ Subscription Renewal',
    message: 'Your Explain Like WhatsApp subscription expires in 7 days. Renew for just ₹150/year!',
  });
}

chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  handleMessage(message).then(sendResponse).catch((err) => {
    sendResponse({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
  });
  return true;
});

async function handleMessage(message: ExtensionMessage) {
  switch (message.type) {
    case 'EXPLAIN_TEXT':
      return handleExplainText(message.payload as unknown as ExplainTextPayload);

    case 'EXPLAIN_WORD':
      return handleExplainWord(message.payload as unknown as ExplainWordPayload);

    case 'GENERATE_NOTES':
      return handleGenerateNotes(message.payload as unknown as GenerateNotesPayload);

    case 'SUMMARIZE_YOUTUBE':
      return handleYouTubeSummary(message.payload as unknown as YouTubeSummaryPayload);

    case 'SUMMARIZE_PDF':
      return handlePdfSummary(message.payload as unknown as PdfSummaryPayload);

    case 'GET_USER': {
      const profile = await getLocalProfile();
      if (profile?.uid) {
        const fresh = await getUserProfile(profile.uid as string);
        if (fresh) {
          await saveLocalProfile(fresh as unknown as Record<string, unknown>);
          return { success: true, profile: fresh, subscriptionStatus: getSubscriptionStatus(fresh) };
        }
      }
      return { success: true, profile: null };
    }

    case 'CHECK_USAGE': {
      const profile = await getLocalProfile();
      const mode = message.payload?.mode as string;
      const modeConfig = EXPLANATION_MODES.find((m) => m.id === mode);
      const check = canUseFeature(profile as never, modeConfig?.isPremium);
      return { success: true, ...check };
    }

    case 'TRACK_EVENT':
      await trackAnalytics(
        message.payload?.name as string,
        message.payload?.properties as Record<string, string | number | boolean>,
      );
      return { success: true };

    case 'GET_CACHED': {
      const id = message.payload?.id as string;
      const cached = await getCachedExplanation(id);
      return { success: true, data: cached };
    }

    case 'CLEAR_CACHE':
      await clearExpiredCache();
      return { success: true };

    case 'EXPORT_DATA': {
      const { exportAllData } = await import('@/services/storage/indexed-db');
      const data = await exportAllData();
      return { success: true, data };
    }

    case 'VERIFY_PAYMENT': {
      const { orderId, paymentId, signature, userId } = message.payload as Record<string, string>;
      return verifyPayment(orderId, paymentId, signature, userId);
    }

    case 'GET_DAILY_REPORT': {
      const date = (message.payload?.date as string) || new Date().toISOString().split('T')[0];
      const report = await getDailyReport(date);
      return { success: true, report };
    }

    default:
      return { success: false, error: 'Unknown message type' };
  }
}
