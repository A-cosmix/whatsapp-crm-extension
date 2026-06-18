const STORAGE_PREFIX = 'hiremate_';

export async function getItem<T>(key: string): Promise<T | null> {
  const result = await chrome.storage.local.get(`${STORAGE_PREFIX}${key}`);
  return (result[`${STORAGE_PREFIX}${key}`] as T) ?? null;
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  await chrome.storage.local.set({ [`${STORAGE_PREFIX}${key}`]: value });
}

export async function removeItem(key: string): Promise<void> {
  await chrome.storage.local.remove(`${STORAGE_PREFIX}${key}`);
}

export async function getItems<T>(keys: string[]): Promise<Record<string, T | null>> {
  const prefixed = keys.map((k) => `${STORAGE_PREFIX}${k}`);
  const result = await chrome.storage.local.get(prefixed);
  const mapped: Record<string, T | null> = {};
  for (const key of keys) {
    mapped[key] = (result[`${STORAGE_PREFIX}${key}`] as T) ?? null;
  }
  return mapped;
}

export async function clearAll(): Promise<void> {
  const all = await chrome.storage.local.get(null);
  const keys = Object.keys(all).filter((k) => k.startsWith(STORAGE_PREFIX));
  if (keys.length > 0) await chrome.storage.local.remove(keys);
}
