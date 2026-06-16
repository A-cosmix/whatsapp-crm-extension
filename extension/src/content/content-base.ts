/**
 * Shared content script logic for Gmail and Outlook.
 */

import type { EmailAnalysis, EmailPlatform, KeyboardShortcuts, ParsedEmail, ShortcutAction } from '@/types';
import { DEFAULT_PREFERENCES, SNOOZE_OPTIONS } from '@/types';
import {
  addRowBadge,
  addSentimentIndicator,
  collapsePanel,
  hidePanel,
  injectSidebar,
  isPanelVisible,
  openSmartRepliesOnPanel,
  sendMessage,
  showPanel,
  snoozeEmail,
} from '@/shared/panel';
import { maybeStartEmailTour, restartEmailTour } from '@/shared/email-tour';
import {
  eventMatchesShortcut,
  isEditableTarget,
} from '@/utils/shortcuts';
import { trackEvent } from '@/utils/track-event';

interface PlatformConfig {
  platform: EmailPlatform;
  parseOpen: () => ParsedEmail | null;
  parseRow: (row: Element) => ParsedEmail | null;
  insertReply: (text: string) => boolean;
  rowSelector: string;
}

let currentEmail: ParsedEmail | null = null;
let currentAnalysis: EmailAnalysis | null = null;
let activeFilter = 'All';
let observer: MutationObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let shortcuts: KeyboardShortcuts = { ...DEFAULT_PREFERENCES.shortcuts };

export function initContentScript(config: PlatformConfig): void {
  console.log(`[EmailSummarizer] ${config.platform} content script loaded`);

  injectSidebar(config.platform, handleFilter, handleSearch);
  loadShortcuts();
  setupKeyboardShortcuts(config);
  setupMessageListener(config);
  observeEmailChanges(config);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.preferences?.newValue?.shortcuts) {
      shortcuts = {
        ...DEFAULT_PREFERENCES.shortcuts,
        ...changes.preferences.newValue.shortcuts,
      };
    }
  });

  setTimeout(() => tryAnalyzeOpenEmail(config), 1500);

  loadShortcuts().then(() => {
    maybeStartEmailTour(shortcuts.summarize);
  });
}

async function loadShortcuts(): Promise<void> {
  try {
    const prefs = await sendMessage<{ shortcuts: KeyboardShortcuts }>('GET_PREFERENCES');
    shortcuts = { ...DEFAULT_PREFERENCES.shortcuts, ...prefs.shortcuts };
  } catch {
    shortcuts = { ...DEFAULT_PREFERENCES.shortcuts };
  }
}

function setupKeyboardShortcuts(config: PlatformConfig): void {
  document.addEventListener('keydown', (e) => {
    if (isEditableTarget(e.target)) return;

    const actions: Array<{ action: ShortcutAction; handler: () => void }> = [
      { action: 'summarize', handler: () => tryAnalyzeOpenEmail(config, true) },
      { action: 'togglePanel', handler: () => handleTogglePanel(config) },
      { action: 'smartReply', handler: () => handleSmartReplyShortcut(config) },
      { action: 'quickSnooze', handler: () => handleQuickSnooze(config) },
    ];

    for (const { action, handler } of actions) {
      const combo = shortcuts[action];
      if (combo && eventMatchesShortcut(e, combo)) {
        e.preventDefault();
        e.stopPropagation();
        trackEvent('keyboard_shortcut', {
          platform: config.platform,
          metadata: { action },
        });
        handler();
        return;
      }
    }
  });
}

function setupMessageListener(config: PlatformConfig): void {
  chrome.runtime.onMessage.addListener((message) => {
    switch (message.type) {
      case 'SHORTCUT_SUMMARIZE':
      case 'SUMMARIZE_SHORTCUT':
        tryAnalyzeOpenEmail(config, true);
        break;
      case 'SHORTCUT_TOGGLE_PANEL':
        handleTogglePanel(config);
        break;
      case 'SHORTCUT_SMART_REPLY':
        handleSmartReplyShortcut(config);
        break;
      case 'SHORTCUT_QUICK_SNOOZE':
        handleQuickSnooze(config);
        break;
      case 'CONTEXT_SNOOZE':
        if (currentEmail) handleSnooze(config, message.payload.durationMs);
        break;
      case 'START_EMAIL_TOUR':
        restartEmailTour(shortcuts.summarize);
        break;
    }
  });
}

function handleTogglePanel(config: PlatformConfig): void {
  trackEvent('panel_toggled', { platform: config.platform });
  if (isPanelVisible()) {
    collapsePanel();
    return;
  }

  if (currentAnalysis && currentEmail) {
    showPanel('success', currentAnalysis, undefined, buildCallbacks(config));
    return;
  }

  tryAnalyzeOpenEmail(config, true);
}

async function handleSmartReplyShortcut(config: PlatformConfig): Promise<void> {
  if (!currentAnalysis?.smartReplies) {
    await tryAnalyzeOpenEmail(config, true);
  }

  if (currentAnalysis?.smartReplies) {
    if (!isPanelVisible()) {
      showPanel('success', currentAnalysis, undefined, buildCallbacks(config));
    }
    openSmartRepliesOnPanel();
  }
}

function handleQuickSnooze(config: PlatformConfig): void {
  if (!currentEmail) {
    const email = config.parseOpen();
    if (email) currentEmail = email;
  }
  if (currentEmail) {
    handleSnooze(config, SNOOZE_OPTIONS[0].ms);
  }
}

function observeEmailChanges(config: PlatformConfig): void {
  if (observer) observer.disconnect();

  observer = new MutationObserver(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      tryAnalyzeOpenEmail(config);
      processVisibleRows(config);
    }, 800);
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

async function tryAnalyzeOpenEmail(config: PlatformConfig, force = false): Promise<void> {
  const email = config.parseOpen();
  if (!email) return;

  if (!force && currentEmail?.id === email.id && currentAnalysis) return;

  currentEmail = email;
  showPanel('loading', undefined, undefined, buildCallbacks(config));

  try {
    const analysis = await sendMessage<EmailAnalysis>('ANALYZE_EMAIL', {
      email,
      forceRefresh: force,
    });
    currentAnalysis = analysis;
    showPanel('success', analysis, undefined, buildCallbacks(config));
    highlightCurrentRow(config, analysis);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to analyze email.';

    try {
      const cached = await sendMessage<EmailAnalysis | undefined>('GET_CACHED_ANALYSIS', {
        emailId: email.id,
      });
      if (cached) {
        currentAnalysis = cached;
        showPanel('success', cached, undefined, buildCallbacks(config));
        return;
      }
    } catch {
      // no cache
    }

    showPanel('error', undefined, message, buildCallbacks(config));
  }
}

function buildCallbacks(config: PlatformConfig) {
  return {
    onSmartReply: (text: string) => {
      const inserted = config.insertReply(text);
      if (!inserted) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    },
    onSnooze: (durationMs: number) => {
      if (currentEmail) handleSnooze(config, durationMs);
    },
    onRefresh: () => tryAnalyzeOpenEmail(config, true),
    onClose: () => hidePanel(),
  };
}

async function handleSnooze(config: PlatformConfig, durationMs: number): Promise<void> {
  if (!currentEmail) return;

  await snoozeEmail({
    emailId: currentEmail.id,
    subject: currentEmail.subject,
    sender: currentEmail.sender,
    platform: config.platform,
    durationMs,
  });

  showPanel(
    'success',
    currentAnalysis ?? undefined,
    undefined,
    buildCallbacks(config),
  );
}

function highlightCurrentRow(config: PlatformConfig, analysis: EmailAnalysis): void {
  const rows = document.querySelectorAll(config.rowSelector);
  rows.forEach((row) => {
    row.classList.remove('aes-highlight-important', 'aes-highlight-routine', 'aes-highlight-low');
    const parsed = config.parseRow(row);
    if (parsed?.id === analysis.id) {
      const cls =
        analysis.priority === 'Important'
          ? 'aes-highlight-important'
          : analysis.priority === 'Routine'
            ? 'aes-highlight-routine'
            : 'aes-highlight-low';
      row.classList.add(cls);
      addRowBadge(row, analysis);
      addSentimentIndicator(row, analysis.sentiment);
    }
  });
}

const processedRows = new Set<string>();
const MAX_PROCESSED_ROWS = 300;

function trimProcessedRows(): void {
  if (processedRows.size <= MAX_PROCESSED_ROWS) return;
  const keep = [...processedRows].slice(-150);
  processedRows.clear();
  keep.forEach((id) => processedRows.add(id));
}

async function processVisibleRows(config: PlatformConfig): Promise<void> {
  const rows = document.querySelectorAll(config.rowSelector);
  for (const row of rows) {
    const parsed = config.parseRow(row);
    if (!parsed || processedRows.has(parsed.id)) continue;

    if (parsed.body.length < 20) continue;

    processedRows.add(parsed.id);
    trimProcessedRows();

    try {
      const analysis = await sendMessage<EmailAnalysis>('ANALYZE_EMAIL', { email: parsed });
      addRowBadge(row, analysis);
      addSentimentIndicator(row, analysis.sentiment);
      applyFilter(row, analysis);
    } catch {
      // Skip rows that fail silently
    }
  }
}

function handleFilter(priority: string): void {
  activeFilter = priority;
  if (priority !== 'All') {
    trackEvent('filter_applied', { metadata: { priority } });
  }
  document.querySelectorAll('[class*="aes-highlight"]').forEach((row) => {
    const badge = row.querySelector('.aes-row-badge');
    const rowPriority = badge?.getAttribute('title')?.split('|')[0]?.trim() ?? 'All';
    applyFilter(row as Element, { priority: rowPriority } as EmailAnalysis);
  });
}

function applyFilter(row: Element, analysis: EmailAnalysis): void {
  if (activeFilter === 'All') {
    row.classList.remove('aes-filtered-out');
  } else {
    row.classList.toggle('aes-filtered-out', analysis.priority !== activeFilter);
  }
}

async function handleSearch(query: string): Promise<void> {
  if (!query.trim()) {
    document.querySelectorAll('.aes-filtered-out').forEach((el) => {
      el.classList.remove('aes-filtered-out');
    });
    return;
  }

  try {
    trackEvent('search_performed');
    const results = await sendMessage<EmailAnalysis[]>('SEARCH_SUMMARIES', { query });
    const matchIds = new Set(results.map((r) => r.id));

    document.querySelectorAll('[data-legacy-thread-id], [role="option"]').forEach((row) => {
      const id =
        row.getAttribute('data-legacy-thread-id') ??
        row.getAttribute('data-thread-id') ??
        '';
      row.classList.toggle('aes-filtered-out', id ? !matchIds.has(`email_${id}`) && !matchIds.has(id) : true);
    });
  } catch {
    // search failed silently
  }
}
