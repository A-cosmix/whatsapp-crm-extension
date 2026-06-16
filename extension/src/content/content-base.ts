/**
 * Shared content script logic for Gmail and Outlook.
 */

import type { EmailAnalysis, EmailPlatform, ParsedEmail } from '@/types';
import {
  addRowBadge,
  addSentimentIndicator,
  hidePanel,
  injectSidebar,
  sendMessage,
  showPanel,
  snoozeEmail,
} from '@/shared/panel';

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

export function initContentScript(config: PlatformConfig): void {
  console.log(`[EmailSummarizer] ${config.platform} content script loaded`);

  injectSidebar(config.platform, handleFilter, handleSearch);
  setupKeyboardShortcut(config);
  setupMessageListener(config);
  observeEmailChanges(config);

  // Initial analysis if email is already open
  setTimeout(() => tryAnalyzeOpenEmail(config), 1500);
}

function setupKeyboardShortcut(config: PlatformConfig): void {
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      tryAnalyzeOpenEmail(config, true);
    }
  });
}

function setupMessageListener(config: PlatformConfig): void {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'SUMMARIZE_SHORTCUT') {
      tryAnalyzeOpenEmail(config, true);
    }
    if (message.type === 'CONTEXT_SNOOZE' && currentEmail) {
      handleSnooze(config, message.payload.durationMs);
    }
  });
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

async function processVisibleRows(config: PlatformConfig): Promise<void> {
  const rows = document.querySelectorAll(config.rowSelector);
  for (const row of rows) {
    const parsed = config.parseRow(row);
    if (!parsed || processedRows.has(parsed.id)) continue;

    if (parsed.body.length < 20) continue;

    processedRows.add(parsed.id);

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
