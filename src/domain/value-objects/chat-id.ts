/** Match stored chatId against an incoming runtime chatId (name slug vs phone). */
export function chatIdsMatch(stored: string, incoming: string): boolean {
  if (!stored || !incoming) return false;
  if (stored === incoming) return true;

  const storedSlug = stored.replace(/_/g, ' ').toLowerCase();
  const incomingSlug = incoming.replace(/_/g, ' ').toLowerCase();
  if (storedSlug === incomingSlug) return true;

  const storedDigits = stored.replace(/\D/g, '');
  const incomingDigits = incoming.replace(/\D/g, '');
  if (storedDigits.length >= 10 && incomingDigits.length >= 10) {
    if (storedDigits === incomingDigits) return true;
    if (storedDigits.slice(-10) === incomingDigits.slice(-10)) return true;
  }

  return false;
}
