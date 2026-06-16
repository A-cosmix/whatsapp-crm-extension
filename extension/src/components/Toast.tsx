import { useEffect } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onDismiss: () => void;
  durationMs?: number;
}

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-slate-700 text-white',
};

export function Toast({
  message,
  variant = 'info',
  onDismiss,
  durationMs = 4000,
}: ToastProps): React.ReactElement | null {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(timer);
  }, [message, durationMs, onDismiss]);

  if (!message) return null;

  return (
    <div
      role="status"
      className={`fixed bottom-3 left-3 right-3 z-50 px-3 py-2 rounded-lg text-xs shadow-lg flex items-start justify-between gap-2 ${VARIANT_STYLES[variant]}`}
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="opacity-80 hover:opacity-100 shrink-0"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
