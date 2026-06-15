import type { IMessageBus } from '@domain/services/interfaces';

type Handler = (payload: unknown) => void;

export class ChromeMessageBus implements IMessageBus {
  private readonly handlers = new Map<string, Set<Handler>>();

  constructor() {
    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (message?.type && message?.payload !== undefined) {
          this.dispatch(message.type, message.payload);
          sendResponse({ ok: true });
        }
        return true;
      });
    }
  }

  async publish<T>(type: string, payload: T): Promise<void> {
    this.dispatch(type, payload);

    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      try {
        await chrome.runtime.sendMessage({ type, payload });
      } catch {
        // No listeners in some contexts — local dispatch is sufficient
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
