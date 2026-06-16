import { useState, useEffect } from 'react';

interface FocusModeProps {
  onClose: () => void;
}

export function FocusMode({ onClose }: FocusModeProps) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [font, setFont] = useState<'sans' | 'serif' | 'mono'>('serif');
  const [timerMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    const article = document.querySelector('article') || document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
    article.classList.add('elw-focus-mode');

    const distractions = document.querySelectorAll(
      'nav, header, footer, aside, .ad, .ads, .advertisement, .sidebar, [class*="banner"], [id*="sidebar"], iframe:not([src*="youtube"])',
    );
    distractions.forEach((el) => el.classList.add('elw-hidden-distraction'));

    return () => {
      article.classList.remove('elw-focus-mode', 'elw-focus-mode-dark', 'elw-focus-mode-sepia');
      distractions.forEach((el) => el.classList.remove('elw-hidden-distraction'));
    };
  }, []);

  useEffect(() => {
    const article = document.querySelector('article') || document.querySelector('main') || document.body;
    article.classList.remove('elw-focus-mode-dark', 'elw-focus-mode-sepia');
    if (theme === 'dark') article.classList.add('elw-focus-mode-dark');
    if (theme === 'sepia') article.classList.add('elw-focus-mode-sepia');

    const fontFamilies = { sans: 'Inter, system-ui, sans-serif', serif: 'Georgia, Merriweather, serif', mono: 'JetBrains Mono, monospace' };
    (article as HTMLElement).style.fontFamily = fontFamilies[font];
  }, [theme, font]);

  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          chrome.notifications.create({
            type: 'basic',
            iconUrl: chrome.runtime.getURL('public/icon/128.png'),
            title: '⏰ Focus Timer Complete!',
            message: 'Great job! You focused for ' + timerMinutes + ' minutes.',
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timerMinutes]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 2147483647,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        className="elw-glass"
        style={{
          borderRadius: '16px',
          padding: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          minWidth: '200px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '14px', color: '#16a34a' }}>📖 Focus Mode</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {(['light', 'dark', 'sepia'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              style={{
                flex: 1, padding: '6px', borderRadius: '8px', border: theme === t ? '2px solid #25D366' : '1px solid #e5e7eb',
                background: t === 'dark' ? '#1a1a2e' : t === 'sepia' ? '#f4ecd8' : 'white',
                color: t === 'dark' ? 'white' : '#374151', fontSize: '11px', cursor: 'pointer',
              }}
            >
              {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '📜'} {t}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {(['sans', 'serif', 'mono'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFont(f)}
              style={{
                flex: 1, padding: '4px', borderRadius: '6px',
                border: font === f ? '2px solid #25D366' : '1px solid #e5e7eb',
                background: 'white', fontSize: '11px', cursor: 'pointer',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a', fontFamily: 'monospace' }}>
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => { setTimerActive(!timerActive); if (!timerActive) setTimeLeft(timerMinutes * 60); }}
            style={{
              marginTop: '4px', padding: '6px 16px', borderRadius: '8px', border: 'none',
              background: timerActive ? '#ef4444' : '#25D366', color: 'white', cursor: 'pointer', fontSize: '12px',
            }}
          >
            {timerActive ? '⏸ Pause' : '▶ Start'} ({timerMinutes}m)
          </button>
        </div>
      </div>
    </div>
  );
}
