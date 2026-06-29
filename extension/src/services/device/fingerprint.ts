/**
 * Device identity used to stop free-trial abuse (one trial per device).
 *
 * - `deviceId` is a random UUID persisted in chrome.storage.local. It is stable
 *   for the lifetime of an install.
 * - `fingerprint` is a hash of stable browser/device signals (UA, platform,
 *   languages, screen, timezone, CPU/memory). It survives a reinstall on the
 *   same machine, so the backend can detect a device that already burned its
 *   trial even after the extension is reinstalled.
 *
 * The backend (Google Sheet) is the source of truth for whether a trial was
 * already consumed — these values are just the keys it stores.
 */

const DEVICE_ID_KEY = 'deviceId';
const FINGERPRINT_KEY = 'deviceFingerprint';

export interface DeviceIdentity {
  deviceId: string;
  fingerprint: string;
}

/** FNV-1a 32-bit hash, returned as a zero-padded hex string. */
function fnv1aHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Compute a fingerprint from whatever signals are available in the current
 * context. Rich signals (screen, navigator) exist in popup/content contexts;
 * the service worker has a reduced `navigator`, so we degrade gracefully.
 */
export function computeFingerprint(): string {
  const parts: string[] = [];
  try {
    const nav = typeof navigator !== 'undefined' ? navigator : undefined;
    if (nav) {
      parts.push(nav.userAgent || '');
      parts.push(nav.language || '');
      parts.push((nav.languages || []).join(','));
      parts.push(String(nav.hardwareConcurrency ?? ''));
      parts.push(String((nav as { deviceMemory?: number }).deviceMemory ?? ''));
      parts.push(String((nav as { platform?: string }).platform ?? ''));
    }
    if (typeof screen !== 'undefined') {
      parts.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
    }
    parts.push(String(new Date().getTimezoneOffset()));
    try {
      parts.push(Intl.DateTimeFormat().resolvedOptions().timeZone || '');
    } catch {
      // Intl may be unavailable — ignore
    }
  } catch {
    // Never throw while fingerprinting
  }
  return fnv1aHash(parts.filter(Boolean).join('|'));
}

/** Get (or lazily create) the persistent device id. */
export async function getDeviceId(): Promise<string> {
  const stored = await chrome.storage.local.get(DEVICE_ID_KEY);
  let id = stored[DEVICE_ID_KEY] as string | undefined;
  if (!id) {
    id = generateUuid();
    await chrome.storage.local.set({ [DEVICE_ID_KEY]: id });
  }
  return id;
}

/**
 * Persist a fingerprint computed in a rich context (popup/content). Only writes
 * if we have not stored one yet, so the original device signature is preserved.
 */
export async function ensureFingerprintStored(): Promise<string> {
  const stored = await chrome.storage.local.get(FINGERPRINT_KEY);
  let fp = stored[FINGERPRINT_KEY] as string | undefined;
  if (!fp) {
    fp = computeFingerprint();
    await chrome.storage.local.set({ [FINGERPRINT_KEY]: fp });
  }
  return fp;
}

/** Read the stored fingerprint, falling back to a freshly computed one. */
export async function getStoredFingerprint(): Promise<string> {
  const stored = await chrome.storage.local.get(FINGERPRINT_KEY);
  return (stored[FINGERPRINT_KEY] as string | undefined) || computeFingerprint();
}

/** Convenience accessor for both identity values. */
export async function getDeviceIdentity(): Promise<DeviceIdentity> {
  const [deviceId, fingerprint] = await Promise.all([getDeviceId(), getStoredFingerprint()]);
  return { deviceId, fingerprint };
}
