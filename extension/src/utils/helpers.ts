export function sendMessage<T = Record<string, unknown>>(type: string, payload?: Record<string, unknown>): Promise<T> {
  return chrome.runtime.sendMessage({ type, payload });
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getDaysRemaining(endDate: number): number {
  const diff = endDate - Date.now();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '...' : text;
}
