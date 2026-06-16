interface DarkModeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

/** Moon/sun button that toggles between light and dark mode */
export function DarkModeToggle({
  isDark,
  onToggle,
  size = 'md',
  className = '',
}: DarkModeToggleProps): React.ReactElement {
  const sizeClass = size === 'sm' ? 'p-1 text-sm' : 'p-1.5 text-base';

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 ${sizeClass} ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}

interface DarkModeSwitchProps {
  isDark: boolean;
  enabled: boolean;
  onToggle: () => void;
  label?: string;
}

/** Labeled switch row for the options page */
export function DarkModeSwitch({
  isDark,
  enabled,
  onToggle,
  label = 'Dark mode',
}: DarkModeSwitchProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm font-medium">{label}</span>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {enabled ? (isDark ? 'Dark theme enabled' : 'Light theme enabled') : 'Following system'}
        </p>
      </div>
      <button
        type="button"
        className={`toggle ${isDark && enabled ? 'on' : ''}`}
        onClick={onToggle}
        aria-pressed={isDark && enabled}
        aria-label="Toggle dark mode"
        disabled={!enabled}
        style={!enabled ? { opacity: 0.5 } : undefined}
      />
    </div>
  );
}
