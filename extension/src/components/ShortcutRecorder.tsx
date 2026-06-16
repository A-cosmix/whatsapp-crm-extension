import { useCallback, useEffect, useState } from 'react';
import type { ShortcutAction } from '@/types';
import { eventToShortcut, isValidShortcut, SHORTCUT_META } from '@/utils/shortcuts';

interface ShortcutRecorderProps {
  action: ShortcutAction;
  value: string;
  disabled?: boolean;
  onChange: (action: ShortcutAction, shortcut: string) => void;
}

/** Click-to-record keyboard shortcut input */
export function ShortcutRecorder({
  action,
  value,
  disabled = false,
  onChange,
}: ShortcutRecorderProps): React.ReactElement {
  const [recording, setRecording] = useState(false);

  const meta = SHORTCUT_META[action];

  const stopRecording = useCallback(() => {
    setRecording(false);
  }, []);

  useEffect(() => {
    if (!recording) return;

    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape') {
        stopRecording();
        return;
      }

      const shortcut = eventToShortcut(e);
      if (!shortcut) return;

      if (!isValidShortcut(shortcut)) return;

      onChange(action, shortcut);
      stopRecording();
    };

    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [recording, action, onChange, stopRecording]);

  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{meta.label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{meta.description}</p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setRecording(true)}
        className={`min-w-[120px] px-3 py-1.5 text-sm font-mono rounded-lg border transition ${
          recording
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 animate-pulse'
            : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 hover:border-brand-400'
        } disabled:opacity-50`}
        aria-label={`Record shortcut for ${meta.label}`}
      >
        {recording ? 'Press keys…' : value || 'Not set'}
      </button>
    </div>
  );
}

interface ShortcutsSectionProps {
  shortcuts: import('@/types').KeyboardShortcuts;
  onChange: (shortcuts: import('@/types').KeyboardShortcuts) => void;
  onReset: () => void;
}

/** Full keyboard shortcuts customization section for the options page */
export function ShortcutsSection({
  shortcuts,
  onChange,
  onReset,
}: ShortcutsSectionProps): React.ReactElement {
  const handleChange = (action: ShortcutAction, shortcut: string) => {
    onChange({ ...shortcuts, [action]: shortcut });
  };

  const openChromeShortcuts = () => {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  };

  return (
    <div>
      <div className="space-y-1 divide-y divide-slate-100 dark:divide-slate-700">
        {(Object.keys(SHORTCUT_META) as ShortcutAction[]).map((action) => (
          <ShortcutRecorder
            key={action}
            action={action}
            value={shortcuts[action]}
            onChange={handleChange}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onReset}
          className="text-xs px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Reset to defaults
        </button>
        <button
          type="button"
          onClick={openChromeShortcuts}
          className="text-xs px-3 py-1.5 text-brand-600 hover:underline"
        >
          Chrome shortcut settings ↗
        </button>
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Click a shortcut to record a new key combination. Shortcuts work on Gmail and Outlook
        when you&apos;re not typing in a text field. Press Esc to cancel recording.
      </p>
    </div>
  );
}
