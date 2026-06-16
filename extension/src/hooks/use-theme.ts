import { useCallback, useEffect, useState } from 'react';
import type { UserPreferences } from '@/types';
import {
  applyDocumentTheme,
  darkModeLabel,
  toggleDarkModeSetting,
  type DarkModeSetting,
} from '@/utils/theme';

async function sendMessage<T>(type: string, payload?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type, payload }, (response) => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else if (response?.success) resolve(response.data as T);
      else reject(new Error(response?.error ?? 'Unknown error'));
    });
  });
}

export function useTheme() {
  const [darkMode, setDarkMode] = useState<DarkModeSetting>('system');
  const [isDark, setIsDark] = useState(false);

  const apply = useCallback((setting: DarkModeSetting) => {
    setIsDark(applyDocumentTheme(setting));
  }, []);

  useEffect(() => {
    sendMessage<UserPreferences>('GET_PREFERENCES')
      .then((prefs) => {
        setDarkMode(prefs.darkMode);
        apply(prefs.darkMode);
      })
      .catch(() => apply('system'));
  }, [apply]);

  // Re-apply when system preference changes while in "system" mode
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (darkMode === 'system') apply('system');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [darkMode, apply]);

  const setTheme = useCallback(
    async (setting: DarkModeSetting) => {
      const prefs = await sendMessage<UserPreferences>('GET_PREFERENCES');
      const updated = { ...prefs, darkMode: setting };
      await sendMessage('SAVE_PREFERENCES', updated);
      setDarkMode(setting);
      apply(setting);
    },
    [apply],
  );

  const toggle = useCallback(async () => {
    const next = toggleDarkModeSetting(darkMode);
    await setTheme(next);
  }, [darkMode, setTheme]);

  const useSystemTheme = useCallback(async () => {
    await setTheme('system');
  }, [setTheme]);

  return {
    isDark,
    darkMode,
    label: darkModeLabel(darkMode, isDark),
    toggle,
    setTheme,
    useSystemTheme,
  };
}
