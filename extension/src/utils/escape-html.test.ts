import { describe, expect, it } from 'vitest';
import { escapeHtml } from './escape-html';

describe('escapeHtml', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
    );
  });

  it('escapes ampersands and quotes', () => {
    expect(escapeHtml(`Tom & Jerry's "house"`)).toBe(
      'Tom &amp; Jerry&#39;s &quot;house&quot;',
    );
  });

  it('leaves safe text unchanged', () => {
    expect(escapeHtml('Hello world')).toBe('Hello world');
  });
});
