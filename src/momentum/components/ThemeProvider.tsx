import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AccentTheme, AppSettings, ThemeMode } from '../types';
import { sendMessage, MessageTypes, type ExtensionState } from '../lib/messages';

interface ThemeContextValue {
  theme: ThemeMode;
  accent: AccentTheme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: ThemeMode) => void;
  setAccent: (accent: AccentTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(mode: ThemeMode): 'dark' | 'light' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [accent, setAccentState] = useState<AccentTheme>('electric');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    sendMessage<ExtensionState>(MessageTypes.GET_STATE)
      .then((state) => {
        setThemeState(state.settings.theme);
        setAccentState(state.settings.accent);
      })
      .catch(() => {});

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setResolvedTheme(resolveTheme(theme));
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.setAttribute('data-accent', accent);
  }, [theme, accent]);

  const setTheme = async (t: ThemeMode) => {
    setThemeState(t);
    await sendMessage(MessageTypes.UPDATE_SETTINGS, { theme: t });
  };

  const setAccent = async (a: AccentTheme) => {
    setAccentState(a);
    await sendMessage(MessageTypes.UPDATE_SETTINGS, { accent: a });
  };

  return (
    <ThemeContext.Provider value={{ theme, accent, resolvedTheme, setTheme, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
