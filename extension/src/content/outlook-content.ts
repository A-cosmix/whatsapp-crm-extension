/**
 * Outlook content script — injects AI analysis panel and inbox enhancements.
 */

import { initContentScript } from '@/content/content-base';
import { parseOutlookOpenEmail, parseOutlookRow, insertOutlookReply } from '@/utils/parser';

initContentScript({
  platform: 'outlook',
  parseOpen: parseOutlookOpenEmail,
  parseRow: parseOutlookRow,
  insertReply: insertOutlookReply,
  rowSelector: 'div[role="option"][aria-label]',
});
