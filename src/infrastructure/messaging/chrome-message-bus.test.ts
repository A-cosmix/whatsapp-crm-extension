import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChromeMessageBus } from './chrome-message-bus';

describe('ChromeMessageBus', () => {
  let bus: ChromeMessageBus;

  beforeEach(() => {
    bus = new ChromeMessageBus();
    vi.restoreAllMocks();
  });

  it('dispatches to in-process subscribers on publish', async () => {
    const handler = vi.fn();
    bus.subscribe('TEST_EVENT', handler);

    await bus.publish('TEST_EVENT', { value: 42 });

    expect(handler).toHaveBeenCalledWith({ value: 42 });
  });

  it('supports multiple subscribers for the same event', async () => {
    const a = vi.fn();
    const b = vi.fn();
    bus.subscribe('MULTI', a);
    bus.subscribe('MULTI', b);

    await bus.publish('MULTI', { ok: true });

    expect(a).toHaveBeenCalledWith({ ok: true });
    expect(b).toHaveBeenCalledWith({ ok: true });
  });
});
