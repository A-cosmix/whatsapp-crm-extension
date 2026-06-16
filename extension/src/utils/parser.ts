/**
 * Email content extraction from Gmail and Outlook DOM.
 * Uses resilient selectors with fallbacks for DOM changes.
 */

import type { EmailPlatform, ParsedEmail } from '@/types';

const MEETING_KEYWORDS = [
  'meeting',
  'call',
  'sync',
  'standup',
  'zoom',
  'teams',
  'google meet',
  'conference',
  'huddle',
];

/** Check if text contains meeting-related keywords */
export function hasMeetingKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return MEETING_KEYWORDS.some((kw) => lower.includes(kw));
}

/** Strip HTML tags and normalize whitespace */
export function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent ?? '')
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Extract plain text from an element, ignoring scripts/styles */
export function extractTextContent(element: Element | null): string {
  if (!element) return '';
  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('script, style, noscript').forEach((el) => el.remove());
  return (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
}

/** Generate a stable ID from email metadata */
export function generateEmailId(subject: string, sender: string, date?: string): string {
  const raw = `${subject}|${sender}|${date ?? ''}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return `email_${Math.abs(hash).toString(36)}`;
}

/** Parse sender string into name and email parts */
export function parseSender(raw: string): { name: string; email: string } {
  const emailMatch = raw.match(/<([^>]+)>/);
  const email = emailMatch?.[1] ?? raw;
  const name = raw.replace(/<[^>]+>/, '').replace(/"/g, '').trim() || email;
  return { name, email };
}

const GMAIL_SELECTORS = {
  emailBody: ['div.a3s.aiL', 'div.a3s', 'div[data-message-id] div[dir="ltr"]', '.gs .a3s'],
  subject: ['h2.hP', '[data-legacy-thread-id] h2', '.ha h2'],
  sender: ['span.gD', '.gE .gD', '[email]'],
  date: ['span.g3', '.g3', '[data-tooltip*="Date"]'],
  inboxRow: 'tr.zA',
  rowSubject: 'span.bog',
  rowSender: 'span.zF, span.yW span[email]',
  rowSnippet: 'span.y2',
  composeReply: 'div[aria-label="Message Body"], div.Am.Al.editable',
};

export function parseGmailOpenEmail(): ParsedEmail | null {
  let bodyEl: Element | null = null;
  for (const sel of GMAIL_SELECTORS.emailBody) {
    bodyEl = document.querySelector(sel);
    if (bodyEl) break;
  }
  if (!bodyEl) return null;

  let subject = '';
  for (const sel of GMAIL_SELECTORS.subject) {
    const el = document.querySelector(sel);
    if (el?.textContent) {
      subject = el.textContent.trim();
      break;
    }
  }

  let senderRaw = '';
  for (const sel of GMAIL_SELECTORS.sender) {
    const el = document.querySelector(sel);
    if (el) {
      senderRaw = el.getAttribute('email') ?? el.textContent?.trim() ?? '';
      if (senderRaw) break;
    }
  }

  let date = '';
  for (const sel of GMAIL_SELECTORS.date) {
    const el = document.querySelector(sel);
    if (el?.textContent) {
      date = el.textContent.trim();
      break;
    }
  }

  const body = extractTextContent(bodyEl);
  if (!body || body.length < 10) return null;

  const { name, email } = parseSender(senderRaw);

  return {
    id: generateEmailId(subject, email, date),
    subject: subject || '(No subject)',
    sender: name,
    senderEmail: email,
    body,
    date,
    platform: 'gmail',
  };
}

export function parseGmailRow(row: Element): ParsedEmail | null {
  const subjectEl = row.querySelector(GMAIL_SELECTORS.rowSubject);
  const senderEl = row.querySelector(GMAIL_SELECTORS.rowSender);
  const snippetEl = row.querySelector(GMAIL_SELECTORS.rowSnippet);

  const subject = subjectEl?.textContent?.trim() ?? '';
  const senderRaw = senderEl?.getAttribute('email') ?? senderEl?.textContent?.trim() ?? '';
  const snippet = snippetEl?.textContent?.trim() ?? '';

  if (!subject && !senderRaw) return null;

  const { name, email } = parseSender(senderRaw);
  const threadId = row.getAttribute('data-legacy-thread-id') ?? '';

  return {
    id: threadId || generateEmailId(subject, email),
    subject: subject || '(No subject)',
    sender: name,
    senderEmail: email,
    body: snippet,
    platform: 'gmail',
  };
}

export function getGmailReplyBox(): HTMLElement | null {
  for (const sel of GMAIL_SELECTORS.composeReply.split(', ')) {
    const el = document.querySelector<HTMLElement>(sel);
    if (el) return el;
  }
  return null;
}

export function insertGmailReply(text: string): boolean {
  const box = getGmailReplyBox();
  if (!box) return false;
  box.focus();
  document.execCommand('selectAll', false);
  document.execCommand('insertText', false, text);
  return true;
}

const OUTLOOK_SELECTORS = {
  emailBody: [
    'div[aria-label="Message body"]',
    'div[data-app-section="ReadingPane"] div[role="document"]',
    '.allowTextSelection',
    '#ItemBody',
  ],
  subject: ['span[id*="SubjectText"]', '[aria-label*="Subject"]', 'div[role="heading"][aria-level="2"]'],
  sender: ['span[title*="@"]', 'button[aria-label*="From"]', '.allowTextSelection[title*="@"]'],
  date: ['span[title*="202"]', '[aria-label*="Received"]'],
  inboxRow: 'div[role="option"][aria-label]',
  composeReply: 'div[aria-label="Message body, press Alt+F10 to exit"]',
};

export function parseOutlookOpenEmail(): ParsedEmail | null {
  let bodyEl: Element | null = null;
  for (const sel of OUTLOOK_SELECTORS.emailBody) {
    bodyEl = document.querySelector(sel);
    if (bodyEl && extractTextContent(bodyEl).length > 20) break;
    bodyEl = null;
  }
  if (!bodyEl) return null;

  let subject = '';
  for (const sel of OUTLOOK_SELECTORS.subject) {
    const el = document.querySelector(sel);
    if (el?.textContent) {
      subject = el.textContent.trim();
      break;
    }
  }

  let senderRaw = '';
  for (const sel of OUTLOOK_SELECTORS.sender) {
    const el = document.querySelector(sel);
    if (el) {
      senderRaw = el.getAttribute('title') ?? el.textContent?.trim() ?? '';
      if (senderRaw.includes('@')) break;
    }
  }

  let date = '';
  for (const sel of OUTLOOK_SELECTORS.date) {
    const el = document.querySelector(sel);
    if (el) {
      date = el.getAttribute('title') ?? el.textContent?.trim() ?? '';
      if (date) break;
    }
  }

  const body = extractTextContent(bodyEl);
  if (!body || body.length < 10) return null;

  const { name, email } = parseSender(senderRaw);

  return {
    id: generateEmailId(subject, email, date),
    subject: subject || '(No subject)',
    sender: name,
    senderEmail: email,
    body,
    date,
    platform: 'outlook',
  };
}

export function parseOutlookRow(row: Element): ParsedEmail | null {
  const label = row.getAttribute('aria-label') ?? '';
  if (!label) return null;

  const parts = label.split(',').map((p) => p.trim());
  const subject = parts[0] ?? '';
  const senderRaw = parts.find((p) => p.includes('@')) ?? parts[1] ?? '';
  const { name, email } = parseSender(senderRaw);

  return {
    id: generateEmailId(subject, email),
    subject: subject || '(No subject)',
    sender: name,
    senderEmail: email,
    body: label,
    platform: 'outlook',
  };
}

export function insertOutlookReply(text: string): boolean {
  for (const sel of OUTLOOK_SELECTORS.composeReply.split(', ')) {
    const box = document.querySelector<HTMLElement>(sel);
    if (box) {
      box.focus();
      document.execCommand('selectAll', false);
      document.execCommand('insertText', false, text);
      return true;
    }
  }
  return false;
}

export function buildGoogleCalendarUrl(meeting: {
  date?: string;
  time?: string;
  agenda?: string;
  meetingLink?: string;
}): string {
  const params = new URLSearchParams();
  params.set('action', 'TEMPLATE');
  params.set('text', meeting.agenda ?? 'Meeting');
  if (meeting.date) params.set('dates', meeting.date);
  if (meeting.agenda) params.set('details', meeting.agenda);
  if (meeting.meetingLink) params.set('location', meeting.meetingLink);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function getPlatformParser(platform: EmailPlatform) {
  return platform === 'gmail'
    ? { parseOpen: parseGmailOpenEmail, parseRow: parseGmailRow, insertReply: insertGmailReply }
    : { parseOpen: parseOutlookOpenEmail, parseRow: parseOutlookRow, insertReply: insertOutlookReply };
}
