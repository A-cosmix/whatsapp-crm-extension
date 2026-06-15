import type { ConversationMessage, ContactInfo } from '@domain/services/interfaces';
import type { WhatsAppActionRequest } from '@domain/messages';

const DEBOUNCE_MS = 500;
const seenMessageIds = new Set<string>();
let lastChatId = '';

function getMessageInput(): HTMLElement | null {
  return document.querySelector('#main [contenteditable="true"][role="textbox"]');
}

function getActiveChatTitle(): string {
  const header = document.querySelector('#main header span[title]');
  return header?.getAttribute('title') ?? 'Unknown';
}

function getHeaderSubtitle(): string {
  const subtitle = document.querySelector('#main header span[data-testid="selectable-text"]');
  return subtitle?.textContent?.trim() ?? '';
}

function extractPhoneFromText(text: string): string {
  const digits = text.replace(/[^\d+]/g, '');
  if (digits.length >= 10) return digits.startsWith('+') ? digits : `+${digits}`;
  return '';
}

function getActiveChatId(): string {
  return getActiveChatTitle().replace(/\s+/g, '_').toLowerCase();
}

function isGroupChat(): boolean {
  return document.querySelector('#main header [data-icon="default-group"]') !== null;
}

function extractMessages(limit: number): ConversationMessage[] {
  const containers = document.querySelectorAll('#main [data-testid="msg-container"]');
  const messages: ConversationMessage[] = [];
  const chatId = getActiveChatId();

  containers.forEach((container, index) => {
    const textEl =
      container.querySelector('[data-testid="msg-text"] span') ??
      container.querySelector('.selectable-text span');
    const text = textEl?.textContent?.trim();
    if (!text) return;

    const isOutgoing = container.closest('.message-out') !== null;
    messages.push({
      id: `${chatId}-${index}-${text.slice(0, 20)}`,
      chatId,
      role: isOutgoing ? 'user' : 'prospect',
      text,
      timestamp: Date.now(),
    });
  });

  return messages.slice(-limit);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendMessage(text: string): Promise<void> {
  const input = getMessageInput();
  if (!input) throw new Error('Message input not found');

  input.focus();
  input.textContent = text;
  input.dispatchEvent(new InputEvent('input', { bubbles: true }));

  await delay(300);

  const sendButton =
    document.querySelector('#main [data-testid="send"]') ??
    document.querySelector('#main [data-icon="send"]')?.closest('button');

  if (sendButton instanceof HTMLElement) {
    sendButton.click();
  } else {
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }),
    );
  }
}

function isWhatsAppReady(): boolean {
  return document.querySelector('#pane-side') !== null && document.querySelector('#main') !== null;
}

function getContactInfo(): ContactInfo {
  const name = getActiveChatTitle();
  const subtitle = getHeaderSubtitle();
  const phone = extractPhoneFromText(subtitle) || extractPhoneFromText(name);
  return {
    chatId: getActiveChatId(),
    phone,
    name,
    isGroup: isGroupChat(),
  };
}

function notifyChatOpened(chatId: string): void {
  if (chatId === lastChatId || !chatId || chatId === 'unknown') return;
  lastChatId = chatId;
  chrome.runtime.sendMessage({
    type: 'CHAT_OPENED',
    payload: { chatId },
  });
}

async function handleWhatsAppAction(request: WhatsAppActionRequest): Promise<unknown> {
  switch (request.action) {
    case 'isConnected':
      return isWhatsAppReady();

    case 'getActiveChat':
      return isWhatsAppReady() ? getActiveChatId() : null;

    case 'getMessages':
      return extractMessages(request.limit ?? 20);

    case 'getContact':
      return getContactInfo();

    case 'send':
      await sendMessage(request.text ?? '');
      return { sent: true };

    case 'openChat':
      return { opened: true };

    default:
      throw new Error(`Unknown action: ${request.action}`);
  }
}

function notifyIncomingMessage(text: string, messageId: string): void {
  const chatId = getActiveChatId();
  chrome.runtime.sendMessage({
    type: 'MESSAGE_RECEIVED',
    payload: {
      chatId,
      text,
      messageId,
      timestamp: Date.now(),
      isGroup: isGroupChat(),
    },
  });
}

function observeMessages(): void {
  const mainPanel = document.querySelector('#main');
  if (!mainPanel) {
    setTimeout(observeMessages, 2000);
    return;
  }

  const observer = new MutationObserver(() => {
    const chatId = getActiveChatId();
    notifyChatOpened(chatId);

    const containers = document.querySelectorAll('#main [data-testid="msg-container"]');
    const last = containers[containers.length - 1];
    if (!last) return;

    const isOutgoing = last.closest('.message-out') !== null;
    if (isOutgoing) return;

    const textEl =
      last.querySelector('[data-testid="msg-text"] span') ??
      last.querySelector('.selectable-text span');
    const text = textEl?.textContent?.trim();
    if (!text) return;

    const messageId = `msg-${text.slice(0, 30)}-${containers.length}`;
    if (seenMessageIds.has(messageId)) return;

    seenMessageIds.add(messageId);
    if (seenMessageIds.size > 500) {
      const first = seenMessageIds.values().next().value;
      if (first) seenMessageIds.delete(first);
    }

    setTimeout(() => notifyIncomingMessage(text, messageId), DEBOUNCE_MS);
  });

  observer.observe(mainPanel, { childList: true, subtree: true });
  observer.observe(document.querySelector('#pane-side') ?? document.body, {
    childList: true,
    subtree: true,
  });
}

export default defineContentScript({
  matches: ['https://web.whatsapp.com/*'],
  runAt: 'document_idle',
  main() {
    observeMessages();

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.type === 'WHATSAPP_ACTION') {
        handleWhatsAppAction(message.payload as WhatsAppActionRequest)
          .then((data) => sendResponse({ success: true, data }))
          .catch((error) =>
            sendResponse({
              success: false,
              error: error instanceof Error ? error.message : 'Action failed',
            }),
          );
        return true;
      }
      return false;
    });
  },
});
