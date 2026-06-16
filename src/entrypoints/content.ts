import type { ConversationMessage, ContactInfo } from '@domain/services/interfaces';
import type { WhatsAppActionRequest } from '@domain/messages';
import { MessageTypes } from '@domain/messages';
import { chatIdsMatch, normalizeChatId } from '@infrastructure/whatsapp/chat-id';

const DEBOUNCE_MS = 500;
const seenMessageIds = new Set<string>();
let lastChatId = '';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitFor(condition: () => boolean, timeoutMs: number, intervalMs = 200): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (condition()) {
        resolve();
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error('Timed out waiting for WhatsApp UI'));
        return;
      }
      setTimeout(tick, intervalMs);
    };
    tick();
  });
}

function getMessageInput(): HTMLElement | null {
  return (
    document.querySelector('#main [contenteditable="true"][role="textbox"]') ??
    document.querySelector('footer [contenteditable="true"]')
  );
}

function getActiveChatTitle(): string {
  const header =
    document.querySelector('#main header span[title]') ??
    document.querySelector('#main header [data-testid="conversation-info-header"] span');
  return header?.getAttribute('title') ?? header?.textContent?.trim() ?? 'Unknown';
}

function getHeaderSubtitle(): string {
  const subtitle = document.querySelector(
    '#main header span[data-testid="selectable-text"]',
  );
  return subtitle?.textContent?.trim() ?? '';
}

function extractPhoneFromText(text: string): string {
  const match = text.match(/\+?[\d][\d\s\-()]{8,}[\d]/);
  if (!match) return '';
  const digits = match[0].replace(/[^\d+]/g, '');
  if (digits.replace(/\D/g, '').length < 10) return '';
  return digits.startsWith('+') ? digits : `+${digits}`;
}

function getActiveChatId(): string {
  const title = getActiveChatTitle();
  const subtitle = getHeaderSubtitle();
  return normalizeChatId(title, extractPhoneFromText(subtitle) || extractPhoneFromText(title));
}

function isGroupChat(): boolean {
  return (
    document.querySelector('#main header [data-icon="default-group"]') !== null ||
    document.querySelector('#main header [data-icon="group"]') !== null
  );
}

function isWhatsAppReady(): boolean {
  return document.querySelector('#pane-side') !== null;
}

async function searchAndOpenChat(query: string): Promise<void> {
  const searchButton =
    document.querySelector('[data-icon="search"]')?.closest('button') ??
    document.querySelector('[title="Search or start new chat"]');

  if (searchButton instanceof HTMLElement) {
    searchButton.click();
    await delay(400);
  }

  const searchInput =
    document.querySelector('#side [contenteditable="true"]') ??
    document.querySelector('[data-testid="chat-list-search"]');

  if (!searchInput) throw new Error('Search box not found');

  searchInput.textContent = query;
  searchInput.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
  await delay(900);

  const chatItem =
    document.querySelector('#pane-side [role="listitem"]') ??
    document.querySelector('#pane-side [data-testid="cell-frame-container"]');

  if (!(chatItem instanceof HTMLElement)) {
    throw new Error(`Chat not found for: ${query}`);
  }

  chatItem.click();
  await waitFor(() => getMessageInput() !== null, 12000);
  await delay(600);
}

async function openChatByPhone(phone: string): Promise<void> {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) throw new Error('Invalid phone number');

  const url = `https://web.whatsapp.com/send?phone=${digits}`;
  if (!window.location.href.includes(`phone=${digits}`)) {
    window.location.href = url;
    await waitFor(() => getMessageInput() !== null, 20000);
    await delay(1200);
  }
}

async function ensureChatOpen(request: WhatsAppActionRequest): Promise<void> {
  if (request.phone) {
    await openChatByPhone(request.phone);
    return;
  }
  if (request.name) {
    await searchAndOpenChat(request.name);
    return;
  }
  const activeChatId = getActiveChatId();
  if (request.chatId && !chatIdsMatch(request.chatId, activeChatId)) {
    const titleGuess = request.chatId.replace(/_/g, ' ');
    await searchAndOpenChat(titleGuess);
  }
}

async function scrapePhoneFromContactInfo(): Promise<string> {
  const headerBtn =
    document.querySelector('#main header [data-testid="conversation-info-header"]') ??
    document.querySelector('#main header img')?.closest('div');

  if (headerBtn instanceof HTMLElement) {
    headerBtn.click();
    await delay(800);
  }

  const allText = Array.from(document.querySelectorAll('[data-testid="selectable-text"], span'))
    .map((el) => el.textContent?.trim() ?? '')
    .join(' ');

  const phone = extractPhoneFromText(allText);
  if (phone) return phone;

  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  return '';
}

function getMessageContainers(): NodeListOf<Element> {
  return document.querySelectorAll(
    '#main [data-testid="msg-container"], #main [role="row"], #main .message-in, #main .message-out',
  );
}

function extractMessageText(container: Element): string {
  const textEl =
    container.querySelector('[data-testid="msg-text"] span') ??
    container.querySelector('[data-testid="msg-text"]') ??
    container.querySelector('.selectable-text span') ??
    container.querySelector('.copyable-text span') ??
    container.querySelector('[dir="ltr"] span');
  return textEl?.textContent?.trim() ?? '';
}

function isOutgoingMessage(container: Element): boolean {
  return (
    container.classList.contains('message-out') ||
    container.closest('.message-out') !== null ||
    container.getAttribute('data-id')?.startsWith('true_') === true
  );
}

function extractMessages(limit: number): ConversationMessage[] {
  const containers = getMessageContainers();
  const messages: ConversationMessage[] = [];
  const chatId = getActiveChatId();

  containers.forEach((container, index) => {
    const text = extractMessageText(container);
    if (!text) return;

    const isOutgoing = isOutgoingMessage(container);

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

async function sendMessage(text: string): Promise<void> {
  const input = getMessageInput();
  if (!input) throw new Error('Message input not found');

  input.focus();
  await delay(100);

  // Lexical / contenteditable compatible input
  input.textContent = '';
  input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' }));

  const dataTransfer = new DataTransfer();
  dataTransfer.setData('text/plain', text);
  input.dispatchEvent(
    new ClipboardEvent('paste', { bubbles: true, clipboardData: dataTransfer }),
  );

  if (!input.textContent?.includes(text.slice(0, 10))) {
    input.textContent = text;
    input.dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }),
    );
  }

  await delay(400);

  const sendButton =
    document.querySelector('#main [data-testid="send"]') ??
    document.querySelector('#main [data-icon="send"]')?.closest('button');

  if (sendButton instanceof HTMLElement) {
    sendButton.click();
  } else {
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  await delay(300);
}

async function getContactInfo(): Promise<ContactInfo> {
  let phone = extractPhoneFromText(getHeaderSubtitle()) || extractPhoneFromText(getActiveChatTitle());

  if (!phone) {
    phone = await scrapePhoneFromContactInfo();
  }

  return {
    chatId: getActiveChatId(),
    phone,
    name: getActiveChatTitle(),
    isGroup: isGroupChat(),
  };
}

async function handleWhatsAppAction(request: WhatsAppActionRequest): Promise<unknown> {
  switch (request.action) {
    case 'isConnected':
      return isWhatsAppReady();

    case 'getActiveChat':
      return isWhatsAppReady() ? getActiveChatId() : null;

    case 'openChat':
      await ensureChatOpen(request);
      return { opened: true };

    case 'getMessages':
      await ensureChatOpen(request);
      return extractMessages(request.limit ?? 20);

    case 'getContact':
      return getContactInfo();

    case 'scrapePhone':
      return scrapePhoneFromContactInfo();

    case 'send':
      await ensureChatOpen(request);
      await sendMessage(request.text ?? '');
      return { sent: true };

    default:
      throw new Error(`Unknown action: ${request.action}`);
  }
}

function notifyIncomingMessage(text: string, messageId: string): void {
  const chatId = getActiveChatId();
  chrome.runtime
    .sendMessage({
      type: MessageTypes.MESSAGE_RECEIVED,
      payload: {
        chatId,
        messageText: text,
        messageId,
        timestamp: Date.now(),
        isGroup: isGroupChat(),
      },
    })
    .catch(() => {
      // Service worker may be restarting — alarm path will retry on next message
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
    if (chatId !== lastChatId && chatId !== 'unknown') {
      lastChatId = chatId;
    }

    const containers = getMessageContainers();
    const last = containers[containers.length - 1];
    if (!last) return;

    if (isOutgoingMessage(last)) return;

    const text = extractMessageText(last);
    if (!text) return;

    const messageId = `msg-${chatId}-${text.slice(0, 30)}-${containers.length}`;
    if (seenMessageIds.has(messageId)) return;

    seenMessageIds.add(messageId);
    if (seenMessageIds.size > 500) {
      const first = seenMessageIds.values().next().value;
      if (first) seenMessageIds.delete(first);
    }

    setTimeout(() => notifyIncomingMessage(text, messageId), DEBOUNCE_MS);
  });

  observer.observe(mainPanel, { childList: true, subtree: true });
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
