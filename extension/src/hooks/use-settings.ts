import { useState, useEffect } from 'react';
import type { UserSettings } from '@/types';
import { getSettings, saveSettings } from '@/services/storage/indexed-db';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const update = async (updates: Partial<UserSettings>) => {
    await saveSettings(updates);
    setSettings((prev) => prev ? { ...prev, ...updates } : null);
  };

  return { settings, loading, update };
}
