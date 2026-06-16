import { chatIdsMatch } from '@domain/value-objects/chat-id';

export { chatIdsMatch };

/** Normalize a WhatsApp chat title or phone into a stable chatId key. */
export function normalizeChatId(title: string, phoneHint?: string): string {
  const phone = phoneHint?.replace(/\D/g, '') ?? '';
  if (phone.length >= 10) return phone;

  const fromTitle = title.match(/\+?[\d][\d\s\-()]{8,}[\d]/);
  if (fromTitle) {
    const digits = fromTitle[0].replace(/\D/g, '');
    if (digits.length >= 10) return digits;
  }

  return title.replace(/\s+/g, '_').toLowerCase();
}
