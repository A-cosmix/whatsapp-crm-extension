export function isExtensionContextValid(): boolean {
  try {
    return Boolean(chrome?.runtime?.id);
  } catch {
    return false;
  }
}

export function sendMessage<T = Record<string, unknown>>(type: string, payload?: Record<string, unknown>): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      if (!isExtensionContextValid()) {
        reject(new Error('EXTENSION_CONTEXT_INVALID'));
        return;
      }

      chrome.runtime.sendMessage({ type, payload }, (response) => {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          const msg = lastError.message || '';
          if (msg.includes('invalidated') || msg.includes('Extension context')) {
            reject(new Error('EXTENSION_CONTEXT_INVALID'));
          } else {
            reject(new Error(msg));
          }
          return;
        }
        if (response === undefined) {
          reject(new Error('Extension is waking up. 5 second wait karo, phir try karo.'));
          return;
        }
        resolve(response as T);
      });
    } catch {
      reject(new Error('EXTENSION_CONTEXT_INVALID'));
    }
  });
}

export async function pingExtension(): Promise<boolean> {
  if (!isExtensionContextValid()) return false;
  try {
    const res = await sendMessage<{ success: boolean }>('PING');
    return res?.success === true;
  } catch {
    return false;
  }
}

const JUNK_TEXT_PATTERNS = [
  /^MHTML\b/i,
  /Snapshot-Content-Location:/i,
  /^MIME-/i,
  /^Content-Type:/i,
  /^boundary=/i,
];

export function isJunkSelection(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  return JUNK_TEXT_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function isValidExplainSelection(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length >= 15 && trimmed.length < 5000 && !isJunkSelection(trimmed);
}

export const EXTENSION_RELOAD_MESSAGE =
  'Extension reload ho gayi hai. Page refresh karo (F5) aur phir dubara try karo.';

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
