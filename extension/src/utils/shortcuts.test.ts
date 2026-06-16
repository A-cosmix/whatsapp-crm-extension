import { describe, expect, it } from 'vitest';
import { DEFAULT_PREFERENCES } from '@/types';
import {
  findShortcutConflicts,
  formatShortcut,
  isValidShortcut,
  parseShortcut,
} from './shortcuts';

describe('parseShortcut', () => {
  it('parses modifier combinations', () => {
    expect(parseShortcut('Alt+Shift+S')).toEqual({
      ctrl: false,
      alt: true,
      shift: true,
      meta: false,
      key: 'S',
    });
  });

  it('returns null for empty input', () => {
    expect(parseShortcut('')).toBeNull();
  });
});

describe('formatShortcut', () => {
  it('round-trips parsed shortcuts', () => {
    const parsed = parseShortcut('Ctrl+Alt+P');
    expect(parsed).not.toBeNull();
    expect(formatShortcut(parsed!)).toBe('Ctrl+Alt+P');
  });
});

describe('isValidShortcut', () => {
  it('accepts valid shortcuts', () => {
    expect(isValidShortcut('Alt+S')).toBe(true);
  });

  it('rejects modifier-only shortcuts', () => {
    expect(isValidShortcut('Alt')).toBe(false);
  });
});

describe('findShortcutConflicts', () => {
  it('detects duplicate bindings', () => {
    const conflicts = findShortcutConflicts({
      ...DEFAULT_PREFERENCES.shortcuts,
      smartReply: DEFAULT_PREFERENCES.shortcuts.summarize,
    });
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts[0]).toContain('summarize');
  });

  it('returns no conflicts for defaults', () => {
    expect(findShortcutConflicts(DEFAULT_PREFERENCES.shortcuts)).toEqual([]);
  });
});
