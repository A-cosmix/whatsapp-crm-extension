/**
 * Keyboard shortcut parsing, validation, and event matching.
 */

import type { KeyboardShortcuts, ShortcutAction } from '@/types';

export const SHORTCUT_META: Record<
  ShortcutAction,
  { label: string; description: string }
> = {
  summarize: {
    label: 'Summarize email',
    description: 'Analyze and summarize the currently open email',
  },
  togglePanel: {
    label: 'Toggle panel',
    description: 'Show or hide the AI analysis panel',
  },
  smartReply: {
    label: 'Smart reply',
    description: 'Open smart reply suggestions',
  },
  quickSnooze: {
    label: 'Quick snooze',
    description: 'Snooze the current email for 1 hour',
  },
};

export interface ParsedShortcut {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  key: string;
}

const MODIFIER_KEYS = new Set(['Control', 'Alt', 'Shift', 'Meta']);

/** Normalize key name for consistent storage */
function normalizeKey(key: string): string {
  if (key === ' ') return 'Space';
  if (key.length === 1) return key.toUpperCase();
  return key;
}

/** Parse a shortcut string like "Alt+Shift+S" into components */
export function parseShortcut(shortcut: string): ParsedShortcut | null {
  const trimmed = shortcut.trim();
  if (!trimmed) return null;

  const parts = trimmed.split('+').map((p) => p.trim());
  const keyPart = parts[parts.length - 1];
  if (!keyPart) return null;

  const modifiers = parts.slice(0, -1).map((p) => p.toLowerCase());

  return {
    ctrl: modifiers.includes('ctrl') || modifiers.includes('control'),
    alt: modifiers.includes('alt'),
    shift: modifiers.includes('shift'),
    meta: modifiers.includes('meta') || modifiers.includes('cmd') || modifiers.includes('command'),
    key: normalizeKey(keyPart),
  };
}

/** Format parsed shortcut back to display string */
export function formatShortcut(parsed: ParsedShortcut): string {
  const parts: string[] = [];
  if (parsed.ctrl) parts.push('Ctrl');
  if (parsed.alt) parts.push('Alt');
  if (parsed.shift) parts.push('Shift');
  if (parsed.meta) parts.push('Meta');
  parts.push(parsed.key);
  return parts.join('+');
}

/** Build shortcut string from a keyboard event (for recording) */
export function eventToShortcut(event: KeyboardEvent): string | null {
  if (MODIFIER_KEYS.has(event.key)) return null;

  // Require at least one modifier for letter/number keys to avoid conflicts with typing
  const hasModifier = event.ctrlKey || event.altKey || event.shiftKey || event.metaKey;
  const isFunctionKey = /^F\d{1,2}$/i.test(event.key);
  if (!hasModifier && !isFunctionKey) return null;

  return formatShortcut({
    ctrl: event.ctrlKey,
    alt: event.altKey,
    shift: event.shiftKey,
    meta: event.metaKey,
    key: normalizeKey(event.key),
  });
}

/** Check if a keyboard event matches a stored shortcut string */
export function eventMatchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parsed = parseShortcut(shortcut);
  if (!parsed) return false;

  return (
    event.ctrlKey === parsed.ctrl &&
    event.altKey === parsed.alt &&
    event.shiftKey === parsed.shift &&
    event.metaKey === parsed.meta &&
    normalizeKey(event.key) === parsed.key
  );
}

/** Validate shortcut format */
export function isValidShortcut(shortcut: string): boolean {
  const parsed = parseShortcut(shortcut);
  if (!parsed) return false;
  if (MODIFIER_KEYS.has(parsed.key)) return false;
  return parsed.key.length >= 1;
}

/** Find duplicate shortcuts across the config */
export function findShortcutConflicts(shortcuts: KeyboardShortcuts): string[] {
  const seen = new Map<string, ShortcutAction>();
  const conflicts: string[] = [];

  for (const [action, combo] of Object.entries(shortcuts) as [ShortcutAction, string][]) {
    const normalized = combo.trim().toLowerCase();
    if (!normalized) continue;

    const existing = seen.get(normalized);
    if (existing) {
      conflicts.push(`"${combo}" is used by both ${existing} and ${action}`);
    } else {
      seen.set(normalized, action);
    }
  }

  return conflicts;
}

/** Whether the event target is an editable field where shortcuts should be ignored */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return !!target.closest('[contenteditable="true"]');
}

/** Map manifest command names to shortcut actions */
export const COMMAND_TO_ACTION: Record<string, ShortcutAction> = {
  'summarize-email': 'summarize',
  'toggle-panel': 'togglePanel',
  'smart-reply': 'smartReply',
  'quick-snooze': 'quickSnooze',
};
