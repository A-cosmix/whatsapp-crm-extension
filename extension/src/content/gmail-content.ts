/**
 * Gmail content script — injects AI analysis panel and inbox enhancements.
 */

import { initContentScript } from '@/content/content-base';
import { parseGmailOpenEmail, parseGmailRow, insertGmailReply } from '@/utils/parser';

initContentScript({
  platform: 'gmail',
  parseOpen: parseGmailOpenEmail,
  parseRow: parseGmailRow,
  insertReply: insertGmailReply,
  rowSelector: 'tr.zA',
});
