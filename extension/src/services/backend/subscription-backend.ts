/**
 * Client for the Google Sheets / Apps Script subscription backend.
 *
 * The Razorpay webhook writes paid subscriptions into a Google Sheet via an
 * Apps Script Web App. This client reads the authoritative subscription + trial
 * state for the current account/device from that Web App so the extension can
 * unlock Pro instantly after payment, and so a device cannot reuse the free
 * trial across accounts.
 *
 * See `docs/GOOGLE_SHEETS_BACKEND.md` for the deployable Apps Script and the
 * exact request/response contract this client expects.
 */
import type { BackendStatus, BackendPlan, UserProfile } from '@/types';

const BACKEND_URL_KEY = 'backendUrl';

/** Resolve the backend Web App URL from settings, falling back to build env. */
export async function getBackendUrl(): Promise<string> {
  try {
    const stored = await chrome.storage.local.get(BACKEND_URL_KEY);
    const fromSettings = (stored[BACKEND_URL_KEY] as string | undefined)?.trim();
    if (fromSettings) return fromSettings;
  } catch {
    // storage unavailable — fall through to env
  }
  const fromEnv = (import.meta.env.VITE_BACKEND_URL || '').trim();
  return fromEnv && !fromEnv.includes('your-backend') ? fromEnv : '';
}

export async function isBackendConfigured(): Promise<boolean> {
  return (await getBackendUrl()).length > 0;
}

function toMs(value: unknown): number | null {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) {
    // Heuristic: treat values below ~Sep 2001 in ms as seconds.
    return value < 1e12 ? Math.round(value * 1000) : Math.round(value);
  }
  if (typeof value === 'string') {
    const asNum = Number(value);
    if (Number.isFinite(asNum) && value.trim() !== '') return toMs(asNum);
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function toBool(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    return v === 'true' || v === '1' || v === 'yes' || v === 'active' || v === 'pro' || v === 'paid';
  }
  return false;
}

function normalizePlan(value: unknown, pro: boolean): BackendPlan {
  const v = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (v === 'pro' || v === 'active' || v === 'paid') return 'pro';
  if (v === 'trial') return 'trial';
  if (v === 'expired') return 'expired';
  if (v === 'free' || v === 'none') return 'free';
  return pro ? 'pro' : 'unknown';
}

/**
 * Convert an arbitrary backend payload into a normalized {@link BackendStatus}.
 * Tolerant of many field-name variants so it keeps working even if the user's
 * Apps Script returns slightly different keys.
 */
export function normalizeBackendStatus(raw: unknown): BackendStatus {
  const empty: BackendStatus = {
    ok: false,
    pro: false,
    plan: 'unknown',
    expiry: null,
    trial: { used: false, start: null, end: null },
  };
  if (!raw || typeof raw !== 'object') return { ...empty, error: 'Empty backend response' };

  const r = raw as Record<string, unknown>;
  const okFlag = r.ok ?? r.success;
  const ok = okFlag === undefined ? true : toBool(okFlag);

  const expiry = toMs(
    r.expiry ?? r.subscriptionExpiry ?? r.expiryDate ?? r.validTill ?? r.validUntil ?? r.expiresAt,
  );
  const now = Date.now();
  const proFlag =
    toBool(r.pro) ||
    toBool(r.isPro) ||
    toBool(r.active) ||
    (typeof r.plan === 'string' && r.plan.trim().toLowerCase() === 'pro') ||
    (typeof r.status === 'string' && r.status.trim().toLowerCase() === 'active');
  // Only honor "pro" if not clearly expired.
  const pro = proFlag && (expiry === null || expiry > now);

  const trialRaw = (r.trial as Record<string, unknown> | undefined) ?? {};
  const ownerEmailRaw =
    trialRaw.ownerEmail ?? trialRaw.email ?? r.trialEmail ?? r.trialOwner ?? r.ownerEmail;

  return {
    ok,
    pro,
    plan: normalizePlan(r.plan ?? r.status, pro),
    expiry,
    paymentId: (r.paymentId ?? r.payment_id ?? r.razorpayPaymentId) as string | undefined,
    trial: {
      used: toBool(trialRaw.used ?? r.trialUsed ?? r.trialUsedBefore),
      start: toMs(trialRaw.start ?? r.trialStart ?? r.trialStartDate),
      end: toMs(trialRaw.end ?? r.trialEnd ?? r.trialEndDate),
      ownerEmail: typeof ownerEmailRaw === 'string' ? ownerEmailRaw : undefined,
    },
    error: typeof r.error === 'string' ? r.error : undefined,
  };
}

/**
 * Apply an authoritative backend status to a profile without ever downgrading a
 * still-valid Pro plan because of a stale/partial backend read.
 */
export function reconcileProfileWithBackend(
  profile: UserProfile,
  status: BackendStatus,
  email: string,
): UserProfile {
  if (!status.ok) return profile;
  const now = Date.now();

  // 1) A paid Pro plan from the backend always wins.
  if (status.pro && status.expiry && status.expiry > now) {
    return {
      ...profile,
      subscriptionStatus: 'active',
      subscriptionExpiry: status.expiry,
      razorpaySubscriptionId: status.paymentId ?? profile.razorpaySubscriptionId ?? 'backend',
    };
  }

  // Keep a locally/remotely valid Pro plan even if the backend doesn't know yet.
  if (
    profile.subscriptionStatus === 'active' &&
    profile.subscriptionExpiry &&
    profile.subscriptionExpiry > now
  ) {
    return profile;
  }

  const owner = status.trial.ownerEmail?.trim().toLowerCase();
  const me = email.trim().toLowerCase();

  // 2) This device already burned its trial on a different account -> expire.
  if (status.trial.used && owner && me && owner !== me) {
    return {
      ...profile,
      subscriptionStatus: 'expired',
      trialEndDate: Math.min(profile.trialEndDate, now - 1),
    };
  }

  // 3) Legit trial owner -> trust the backend's trial window if provided.
  if (status.trial.end && (!owner || owner === me)) {
    return { ...profile, trialEndDate: status.trial.end };
  }

  return profile;
}

function buildSyncUrl(base: string, params: Record<string, string>): string {
  const qs = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return `${base}${base.includes('?') ? '&' : '?'}${qs}`;
}

/**
 * Fetch (and lazily register) the account's subscription + trial state from the
 * backend. Registering happens server-side: calling `sync` records the device's
 * trial if it has never been seen, which is what enables trial-reuse detection.
 */
export async function fetchAccountStatus(
  email: string,
  deviceId: string,
  fingerprint: string,
): Promise<BackendStatus> {
  const base = await getBackendUrl();
  if (!base) {
    return {
      ok: false,
      pro: false,
      plan: 'unknown',
      expiry: null,
      trial: { used: false, start: null, end: null },
      error: 'Backend URL not configured',
    };
  }

  const url = buildSyncUrl(base, {
    action: 'sync',
    email,
    deviceId,
    fingerprint,
  });

  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow' });
    if (!res.ok) {
      return normalizeBackendStatus({ ok: false, error: `HTTP ${res.status}` });
    }
    const data = await res.json();
    return normalizeBackendStatus(data);
  } catch (err) {
    return normalizeBackendStatus({
      ok: false,
      error: err instanceof Error ? err.message : 'Network error',
    });
  }
}

export async function pingBackend(): Promise<boolean> {
  const base = await getBackendUrl();
  if (!base) return false;
  try {
    const res = await fetch(buildSyncUrl(base, { action: 'ping' }), {
      method: 'GET',
      redirect: 'follow',
    });
    return res.ok;
  } catch {
    return false;
  }
}
