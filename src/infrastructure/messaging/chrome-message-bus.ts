import type { IMessageBus } from '@domain/services/interfaces';

type Handler = (payload: unknown) => void;

/**
 * Internal event bus for in-process subscribers only.
 * Cross-context sync uses chrome.runtime.sendMessage via publish().
 * Does NOT register a global onMessage listener (avoids stealing sendResponse from background).
 */
export class ChromeMessageBus implements IMessageBus {
  private readonly handlers = new Map<string, Set<Handler>>();

  async publish<T>(type: string, payload: T): Promise<void> {
    this.dispatch(type, payload);

    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      try {
        await chrome.runtime.sendMessage({ type, payload });
      } catch {
        // Side panel may be closed — ignore
      }
    }
  }

  subscribe<T>(type: string, handler: (payload: T) => void): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler as Handler);
  }

  private dispatch(type: string, payload: unknown): void {
    const handlers = this.handlers.get(type);
    if (!handlers) return;
    for (const handler of handlers) {
      handler(payload);
    }
  }
}
