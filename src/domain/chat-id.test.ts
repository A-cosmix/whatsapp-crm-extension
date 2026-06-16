import { describe, expect, it } from 'vitest';
import { chatIdsMatch } from '@domain/value-objects/chat-id';

describe('chatIdsMatch', () => {
  it('matches identical slugs', () => {
    expect(chatIdsMatch('rahul_sharma', 'rahul_sharma')).toBe(true);
  });

  it('matches name slug to spaced title', () => {
    expect(chatIdsMatch('rahul_sharma', 'rahul sharma')).toBe(true);
  });

  it('matches phone digits with different country code prefix', () => {
    expect(chatIdsMatch('919876543210', '9876543210')).toBe(true);
  });

  it('does not match unrelated chats', () => {
    expect(chatIdsMatch('rahul_sharma', 'amit_verma')).toBe(false);
  });
});
