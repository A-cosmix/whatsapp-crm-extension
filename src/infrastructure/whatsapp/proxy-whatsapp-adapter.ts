import type {
  IWhatsAppAdapter,
  ConversationMessage,
  SendResult,
  ContactInfo,
  SendMessageOptions,
} from '@domain/services/interfaces';
import type { WhatsAppActionRequest, WhatsAppActionResponse } from '@domain/messages';

const WHATSAPP_URL = 'https://web.whatsapp.com/';

async function getWhatsAppTabId(): Promise<number | null> {
  const tabs = await chrome.tabs.query({ url: `${WHATSAPP_URL}*` });
  if (tabs[0]?.id) return tabs[0].id;

  const created = await chrome.tabs.create({ url: WHATSAPP_URL, active: true });
  await new Promise((r) => setTimeout(r, 3000));
  return created.id ?? null;
}

async function sendToContentScript<T>(request: WhatsAppActionRequest): Promise<T> {
  const tabId = await getWhatsAppTabId();
  if (!tabId) {
    throw new Error('WhatsApp Web tab not found. Open web.whatsapp.com first.');
  }

  let response: WhatsAppActionResponse;
  try {
    response = (await chrome.tabs.sendMessage(tabId, {
      type: 'WHATSAPP_ACTION',
      payload: request,
    })) as WhatsAppActionResponse;
  } catch {
    throw new Error('WhatsApp tab not ready. Refresh web.whatsapp.com and try again.');
  }

  if (!response.success) {
    throw new Error(response.error ?? 'WhatsApp action failed');
  }

  return response.data as T;
}

function toActionOptions(options?: SendMessageOptions): Pick<WhatsAppActionRequest, 'phone' | 'name'> {
  return { phone: options?.phone, name: options?.name };
}

export class ProxyWhatsAppAdapter implements IWhatsAppAdapter {
  async isConnected(): Promise<boolean> {
    try {
      const tabId = await getWhatsAppTabId();
      if (!tabId) return false;
      const response = (await chrome.tabs.sendMessage(tabId, {
        type: 'WHATSAPP_ACTION',
        payload: { action: 'isConnected' },
      })) as WhatsAppActionResponse;
      return response.success && response.data === true;
    } catch {
      return false;
    }
  }

  async openChat(options: SendMessageOptions & { chatId?: string }): Promise<void> {
    await sendToContentScript({
      action: 'openChat',
      chatId: options.chatId,
      phone: options.phone,
      name: options.name,
    });
  }

  async send(chatId: string, text: string, options?: SendMessageOptions): Promise<SendResult> {
    try {
      await sendToContentScript({
        action: 'send',
        chatId,
        text,
        ...toActionOptions(options),
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Send failed' };
    }
  }

  async getRecentMessages(
    chatId: string,
    limit: number,
    options?: SendMessageOptions,
  ): Promise<ConversationMessage[]> {
    return sendToContentScript<ConversationMessage[]>({
      action: 'getMessages',
      chatId,
      limit,
      ...toActionOptions(options),
    });
  }

  async getContactInfo(_chatId: string): Promise<ContactInfo | null> {
    return sendToContentScript<ContactInfo | null>({ action: 'getContact' });
  }

  async getActiveChatId(): Promise<string | null> {
    return sendToContentScript<string | null>({ action: 'getActiveChat' });
  }

  async scrapePhone(): Promise<string> {
    return sendToContentScript<string>({ action: 'scrapePhone' });
  }
}
