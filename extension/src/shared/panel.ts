/**
 * Shared floating panel UI injected into Gmail/Outlook.
 * Uses Shadow DOM for style isolation.
 */

import type { EmailAnalysis, EmailPlatform, SnoozePayload } from '@/types';
import {
  PRIORITY_COLORS,
  SENTIMENT_COLORS,
  SENTIMENT_EMOJI,
  SNOOZE_OPTIONS,
} from '@/types';
import { buildGoogleCalendarUrl } from '@/utils/parser';
import { escapeHtml } from '@/utils/escape-html';
import { trackEvent } from '@/utils/track-event';
import {
  isDarkModeActive,
  loadDarkModeSetting,
  toggleStoredDarkMode,
  type DarkModeSetting,
} from '@/utils/theme';

type PanelState = 'loading' | 'success' | 'error' | 'cached';

interface PanelCallbacks {
  onSmartReply: (text: string) => void;
  onSnooze: (durationMs: number) => void;
  onRefresh: () => void;
  onClose: () => void;
}

let panelHost: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let styleEl: HTMLStyleElement | null = null;
let darkModeSetting: DarkModeSetting = 'system';

interface LastPanelState {
  state: PanelState;
  analysis?: EmailAnalysis;
  errorMessage?: string;
  callbacks?: PanelCallbacks;
}

let lastPanelState: LastPanelState | null = null;

function isDarkMode(): boolean {
  return isDarkModeActive(darkModeSetting);
}

function refreshPanelStyles(): void {
  if (styleEl) styleEl.textContent = getStyles();
}

function rerenderPanel(): void {
  if (lastPanelState) {
    showPanel(
      lastPanelState.state,
      lastPanelState.analysis,
      lastPanelState.errorMessage,
      lastPanelState.callbacks,
    );
  }
}

loadDarkModeSetting().then((setting) => {
  darkModeSetting = setting;
  refreshPanelStyles();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync' || !changes.preferences) return;
  const next = changes.preferences.newValue?.darkMode as DarkModeSetting | undefined;
  if (next) {
    darkModeSetting = next;
    refreshPanelStyles();
    rerenderPanel();
  }
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (darkModeSetting === 'system') {
    refreshPanelStyles();
    rerenderPanel();
  }
});

function getStyles(): string {
  const dark = isDarkMode();
  return `
    :host { all: initial; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .aes-panel {
      position: fixed;
      top: 80px;
      right: 24px;
      width: 340px;
      max-height: 80vh;
      overflow-y: auto;
      z-index: 99999;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      background: ${dark ? '#1e1e2e' : '#ffffff'};
      color: ${dark ? '#e2e8f0' : '#1e293b'};
      font-size: 13px;
      line-height: 1.5;
      transition: opacity 0.2s;
    }
    .aes-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid ${dark ? '#334155' : '#e2e8f0'};
      background: ${dark ? '#16161e' : '#f8fafc'};
      border-radius: 12px 12px 0 0;
    }
    .aes-title { font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 6px; }
    .aes-header-actions { display: flex; align-items: center; gap: 4px; }
    .aes-theme-toggle {
      background: none; border: none; cursor: pointer; font-size: 14px;
      padding: 2px 6px; border-radius: 4px;
    }
    .aes-theme-toggle:hover { background: ${dark ? '#334155' : '#e2e8f0'}; }
    .aes-close {
      background: none; border: none; cursor: pointer; font-size: 18px;
      color: ${dark ? '#94a3b8' : '#64748b'}; padding: 2px 6px; border-radius: 4px;
    }
    .aes-close:hover { background: ${dark ? '#334155' : '#e2e8f0'}; }
    .aes-body { padding: 16px; }
    .aes-badge {
      display: inline-block; padding: 2px 8px; border-radius: 999px;
      font-size: 11px; font-weight: 600; color: #fff; margin-bottom: 8px;
    }
    .aes-summary { margin: 8px 0; }
    .aes-summary li { margin: 4px 0 4px 16px; }
    .aes-meta { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
    .aes-sentiment { font-size: 20px; }
    .aes-followup {
      background: ${dark ? '#422006' : '#fef3c7'};
      color: ${dark ? '#fbbf24' : '#92400e'};
      padding: 6px 10px; border-radius: 6px; font-size: 12px; margin-bottom: 10px;
    }
    .aes-meeting {
      background: ${dark ? '#1e3a5f' : '#eff6ff'};
      border-radius: 8px; padding: 10px; margin: 10px 0;
    }
    .aes-meeting h4 { font-size: 12px; font-weight: 600; margin-bottom: 6px; }
    .aes-meeting p { font-size: 12px; margin: 2px 0; }
    .aes-btn {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer;
      font-size: 12px; font-weight: 500; transition: background 0.15s;
    }
    .aes-btn-primary { background: #3b82f6; color: #fff; }
    .aes-btn-primary:hover { background: #2563eb; }
    .aes-btn-secondary {
      background: ${dark ? '#334155' : '#f1f5f9'};
      color: ${dark ? '#e2e8f0' : '#475569'};
    }
    .aes-btn-secondary:hover { background: ${dark ? '#475569' : '#e2e8f0'}; }
    .aes-actions { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 12px; }
    .aes-replies { margin-top: 10px; display: none; }
    .aes-replies.open { display: block; }
    .aes-reply-btn {
      display: block; width: 100%; text-align: left; margin: 4px 0;
      padding: 8px 10px; border-radius: 6px; border: 1px solid ${dark ? '#334155' : '#e2e8f0'};
      background: ${dark ? '#16161e' : '#fff'}; cursor: pointer; font-size: 12px;
      color: inherit;
    }
    .aes-reply-btn:hover { border-color: #3b82f6; }
    .aes-reply-label { font-weight: 600; font-size: 10px; text-transform: uppercase; color: #3b82f6; }
    .aes-snooze-menu {
      display: none; position: absolute; background: ${dark ? '#1e1e2e' : '#fff'};
      border: 1px solid ${dark ? '#334155' : '#e2e8f0'}; border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1; min-width: 120px;
    }
    .aes-snooze-menu.open { display: block; }
    .aes-snooze-item {
      padding: 8px 12px; cursor: pointer; font-size: 12px;
    }
    .aes-snooze-item:hover { background: ${dark ? '#334155' : '#f1f5f9'}; }
    .aes-spinner {
      width: 24px; height: 24px; border: 3px solid ${dark ? '#334155' : '#e2e8f0'};
      border-top-color: #3b82f6; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin: 20px auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .aes-error { color: #ef4444; padding: 12px; text-align: center; }
    .aes-expanded { display: none; margin-top: 10px; padding-top: 10px;
      border-top: 1px solid ${dark ? '#334155' : '#e2e8f0'}; }
    .aes-expanded.open { display: block; }
    .aes-sidebar {
      position: fixed; top: 80px; left: 0; width: 200px; max-height: 60vh;
      overflow-y: auto; z-index: 99998; padding: 8px;
      background: ${dark ? '#1e1e2e' : '#fff'};
      border-right: 1px solid ${dark ? '#334155' : '#e2e8f0'};
      border-radius: 0 8px 8px 0; font-size: 12px;
    }
    .aes-filter-btn {
      display: block; width: 100%; text-align: left; padding: 6px 10px;
      border: none; background: none; cursor: pointer; border-radius: 4px;
      color: inherit; font-size: 12px;
    }
    .aes-filter-btn.active, .aes-filter-btn:hover {
      background: ${dark ? '#334155' : '#eff6ff'}; color: #3b82f6;
    }
    .aes-search {
      width: 100%; padding: 6px 8px; border-radius: 6px; margin-bottom: 6px;
      border: 1px solid ${dark ? '#334155' : '#e2e8f0'};
      background: ${dark ? '#16161e' : '#f8fafc'}; color: inherit; font-size: 12px;
    }
  `;
}

export function ensurePanel(): ShadowRoot {
  if (shadowRoot && panelHost?.isConnected) return shadowRoot;

  panelHost = document.createElement('div');
  panelHost.id = 'aes-panel-host';
  shadowRoot = panelHost.attachShadow({ mode: 'closed' });

  const style = document.createElement('style');
  style.textContent = getStyles();
  styleEl = style;
  shadowRoot.appendChild(style);

  document.body.appendChild(panelHost);
  return shadowRoot;
}

export function showPanel(
  state: PanelState,
  analysis?: EmailAnalysis,
  errorMessage?: string,
  callbacks?: PanelCallbacks,
): void {
  lastPanelState = { state, analysis, errorMessage, callbacks };

  const root = ensurePanel();
  const existing = root.querySelector('.aes-panel');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.className = 'aes-panel';
  panel.setAttribute('role', 'complementary');
  panel.setAttribute('aria-label', 'AI Email Analysis');

  const header = document.createElement('div');
  header.className = 'aes-header';
  const dark = isDarkMode();
  header.innerHTML = `
    <span class="aes-title">✨ AI Summary</span>
    <div class="aes-header-actions">
      <button class="aes-theme-toggle" aria-label="Toggle dark mode" title="${dark ? 'Light mode' : 'Dark mode'}">${dark ? '☀️' : '🌙'}</button>
      <button class="aes-close" aria-label="Close panel">×</button>
    </div>
  `;
  panel.appendChild(header);

  const body = document.createElement('div');
  body.className = 'aes-body';

  if (state === 'loading') {
    body.innerHTML = `<div class="aes-spinner" role="status"><span style="display:none">Processing...</span></div>
      <p style="text-align:center;color:#64748b">Analyzing email...</p>`;
  } else if (state === 'error') {
    const safeMsg = escapeHtml(errorMessage ?? 'Failed to analyze email.');
    body.innerHTML = `<div class="aes-error">${safeMsg}</div>
      <div class="aes-actions"><button class="aes-btn aes-btn-secondary" data-action="retry">Retry</button></div>`;
  } else if (analysis) {
    body.appendChild(buildAnalysisContent(analysis, callbacks));
  }

  panel.appendChild(body);
  root.appendChild(panel);

  header.querySelector('.aes-close')?.addEventListener('click', () => {
    panel.remove();
    callbacks?.onClose();
  });

  header.querySelector('.aes-theme-toggle')?.addEventListener('click', async () => {
    darkModeSetting = await toggleStoredDarkMode();
    refreshPanelStyles();
    rerenderPanel();
  });

  body.querySelector('[data-action="retry"]')?.addEventListener('click', () => {
    callbacks?.onRefresh();
  });
}

function buildAnalysisContent(analysis: EmailAnalysis, callbacks?: PanelCallbacks): HTMLElement {
  const container = document.createElement('div');

  const meta = document.createElement('div');
  meta.className = 'aes-meta';
  meta.innerHTML = `
    <span class="aes-badge" style="background:${PRIORITY_COLORS[analysis.priority]}">${escapeHtml(analysis.priority)}</span>
    <span class="aes-sentiment" title="${escapeHtml(analysis.sentiment)}" style="color:${SENTIMENT_COLORS[analysis.sentiment]}">${SENTIMENT_EMOJI[analysis.sentiment]}</span>
  `;
  container.appendChild(meta);

  if (analysis.needsFollowUp) {
    const followUp = document.createElement('div');
    followUp.className = 'aes-followup';
    followUp.textContent = '⚠️ This email needs a response';
    container.appendChild(followUp);
  }

  const summaryEl = document.createElement('ul');
  summaryEl.className = 'aes-summary';
  for (const point of analysis.summary) {
    const li = document.createElement('li');
    li.textContent = point;
    summaryEl.appendChild(li);
  }
  container.appendChild(summaryEl);

  if (analysis.meeting && (analysis.meeting.date || analysis.meeting.meetingLink)) {
    const meeting = document.createElement('div');
    meeting.className = 'aes-meeting';
    const m = analysis.meeting;
    const link = m.meetingLink && /^https?:\/\//i.test(m.meetingLink) ? m.meetingLink : '';
    meeting.innerHTML = `
      <h4>📅 Meeting Detected</h4>
      ${m.date ? `<p><strong>Date:</strong> ${escapeHtml(m.date)}</p>` : ''}
      ${m.time ? `<p><strong>Time:</strong> ${escapeHtml(m.time)}</p>` : ''}
      ${m.attendees.length ? `<p><strong>Attendees:</strong> ${escapeHtml(m.attendees.join(', '))}</p>` : ''}
      ${m.agenda ? `<p><strong>Agenda:</strong> ${escapeHtml(m.agenda)}</p>` : ''}
      ${link ? `<p><strong>Link:</strong> <a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link)}</a></p>` : ''}
    `;
    const calBtn = document.createElement('button');
    calBtn.className = 'aes-btn aes-btn-primary';
    calBtn.textContent = 'Add to Calendar';
    calBtn.style.marginTop = '8px';
    calBtn.addEventListener('click', () => {
      trackEvent('calendar_add', { platform: analysis.platform });
      window.open(buildGoogleCalendarUrl(analysis.meeting!), '_blank');
    });
    meeting.appendChild(calBtn);
    container.appendChild(meeting);
  }

  const expanded = document.createElement('div');
  expanded.className = 'aes-expanded';
  expanded.innerHTML = `
    <p><strong>Subject:</strong> ${escapeHtml(analysis.subject)}</p>
    <p><strong>From:</strong> ${escapeHtml(analysis.sender)}</p>
    <p><strong>Sentiment:</strong> ${escapeHtml(analysis.sentiment)}</p>
    <p><strong>Analyzed:</strong> ${escapeHtml(new Date(analysis.analyzedAt).toLocaleString())}</p>
  `;
  container.appendChild(expanded);

  const replies = document.createElement('div');
  replies.className = 'aes-replies';
  if (analysis.smartReplies) {
    for (const [style, text] of Object.entries(analysis.smartReplies)) {
      const btn = document.createElement('button');
      btn.className = 'aes-reply-btn';
      btn.innerHTML = `<span class="aes-reply-label">${escapeHtml(style)}</span><br>${escapeHtml(text)}`;
      btn.addEventListener('click', () => {
        trackEvent('smart_reply_used', {
          platform: analysis.platform,
          metadata: { style },
        });
        callbacks?.onSmartReply(text);
      });
      replies.appendChild(btn);
    }
  }
  container.appendChild(replies);

  const actions = document.createElement('div');
  actions.className = 'aes-actions';

  const expandBtn = document.createElement('button');
  expandBtn.className = 'aes-btn aes-btn-secondary';
  expandBtn.textContent = 'View Full Analysis';
  expandBtn.addEventListener('click', () => expanded.classList.toggle('open'));
  actions.appendChild(expandBtn);

  if (analysis.smartReplies) {
    const replyBtn = document.createElement('button');
    replyBtn.className = 'aes-btn aes-btn-primary';
    replyBtn.textContent = 'Smart Reply';
    replyBtn.addEventListener('click', () => replies.classList.toggle('open'));
    actions.appendChild(replyBtn);
  }

  const snoozeWrapper = document.createElement('div');
  snoozeWrapper.style.position = 'relative';
  const snoozeBtn = document.createElement('button');
  snoozeBtn.className = 'aes-btn aes-btn-secondary';
  snoozeBtn.textContent = 'Snooze ▾';
  const snoozeMenu = document.createElement('div');
  snoozeMenu.className = 'aes-snooze-menu';
  for (const opt of SNOOZE_OPTIONS) {
    const item = document.createElement('div');
    item.className = 'aes-snooze-item';
    item.textContent = opt.label;
    item.addEventListener('click', () => {
      callbacks?.onSnooze(opt.ms);
      snoozeMenu.classList.remove('open');
    });
    snoozeMenu.appendChild(item);
  }
  snoozeBtn.addEventListener('click', () => snoozeMenu.classList.toggle('open'));
  snoozeWrapper.appendChild(snoozeBtn);
  snoozeWrapper.appendChild(snoozeMenu);
  actions.appendChild(snoozeWrapper);

  const refreshBtn = document.createElement('button');
  refreshBtn.className = 'aes-btn aes-btn-secondary';
  refreshBtn.textContent = '↻';
  refreshBtn.title = 'Re-analyze';
  refreshBtn.addEventListener('click', () => callbacks?.onRefresh());
  actions.appendChild(refreshBtn);

  container.appendChild(actions);
  return container;
}

export function injectSidebar(
  _platform: EmailPlatform,
  onFilter: (priority: string) => void,
  onSearch: (query: string) => void,
): void {
  const root = ensurePanel();
  if (root.querySelector('.aes-sidebar')) return;

  const sidebar = document.createElement('div');
  sidebar.className = 'aes-sidebar';
  sidebar.innerHTML = `
    <input class="aes-search" type="search" placeholder="Search summaries..." aria-label="Search summaries" />
    <div class="aes-filters">
      <button class="aes-filter-btn active" data-filter="All">All</button>
      <button class="aes-filter-btn" data-filter="Important">🔴 Important</button>
      <button class="aes-filter-btn" data-filter="Routine">🔵 Routine</button>
      <button class="aes-filter-btn" data-filter="Low Priority">⚪ Low Priority</button>
    </div>
  `;

  sidebar.querySelector('.aes-search')?.addEventListener('input', (e) => {
    onSearch((e.target as HTMLInputElement).value);
  });

  sidebar.querySelectorAll('.aes-filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      sidebar.querySelectorAll('.aes-filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      onFilter((btn as HTMLElement).dataset.filter ?? 'All');
    });
  });

  root.appendChild(sidebar);
}

export function addRowBadge(row: Element, analysis: EmailAnalysis): void {
  if (row.querySelector('.aes-row-badge')) return;

  const badge = document.createElement('span');
  badge.className = 'aes-row-badge';
  badge.textContent = analysis.priority === 'Important' ? '!' : '';
  badge.title = `${analysis.priority} | ${analysis.sentiment}`;
  badge.style.cssText = `
    display: inline-flex; align-items: center; justify-content: center;
    width: 16px; height: 16px; border-radius: 50%; font-size: 10px;
    font-weight: bold; color: #fff; margin-right: 4px; vertical-align: middle;
    background: ${PRIORITY_COLORS[analysis.priority]};
  `;

  const subjectEl =
    row.querySelector('span.bog') ??
    row.querySelector('[data-thread-id]') ??
    row.firstElementChild;
  subjectEl?.prepend(badge);

  if (analysis.needsFollowUp) {
    const dot = document.createElement('span');
    dot.title = 'Needs follow-up';
    dot.textContent = '↩';
    dot.style.cssText = 'color:#f59e0b;margin-left:2px;font-size:11px;';
    badge.after(dot);
  }
}

export function addSentimentIndicator(row: Element, sentiment: string): void {
  if (row.querySelector('.aes-sentiment-dot')) return;
  const emoji = SENTIMENT_EMOJI[sentiment as keyof typeof SENTIMENT_EMOJI] ?? '😐';
  const dot = document.createElement('span');
  dot.className = 'aes-sentiment-dot';
  dot.textContent = emoji;
  dot.style.cssText = 'margin-right:4px;font-size:14px;vertical-align:middle;';
  row.querySelector('span.zF, span[email], [aria-label]')?.prepend(dot);
}

export function isPanelVisible(): boolean {
  return !!shadowRoot?.querySelector('.aes-panel');
}

/** Hide only the analysis panel, keeping sidebar and host intact */
export function collapsePanel(): void {
  shadowRoot?.querySelector('.aes-panel')?.remove();
}

/** Expand the smart replies section on the open panel */
export function openSmartRepliesOnPanel(): void {
  shadowRoot?.querySelector('.aes-replies')?.classList.add('open');
}

export function hidePanel(): void {
  panelHost?.remove();
  panelHost = null;
  shadowRoot = null;
}

export async function sendMessage<T>(type: string, payload?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type, payload }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (response?.success) {
        resolve(response.data as T);
      } else {
        reject(new Error(response?.error ?? 'Unknown error'));
      }
    });
  });
}

export async function snoozeEmail(payload: SnoozePayload): Promise<void> {
  await sendMessage('SNOOZE_EMAIL', payload);
}
