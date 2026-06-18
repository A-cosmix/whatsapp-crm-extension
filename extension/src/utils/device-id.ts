const DEVICE_ID_KEY = 'elw_device_id';

function generateDeviceId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return `dev_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
}

export async function getDeviceId(): Promise<string> {
  const stored = await chrome.storage.local.get(DEVICE_ID_KEY);
  const existing = stored[DEVICE_ID_KEY] as string | undefined;
  if (existing) return existing;

  const deviceId = generateDeviceId();
  await chrome.storage.local.set({ [DEVICE_ID_KEY]: deviceId });
  return deviceId;
}
