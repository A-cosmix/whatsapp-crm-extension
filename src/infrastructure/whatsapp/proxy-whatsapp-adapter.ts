import type {
  IWhatsAppAdapter,
  ConversationMessage,
  SendResult,
  ContactInfo,
} from '@domain/services/interfaces';
import type { WhatsAppActionRequest, WhatsAppActionResponse } from '@domain/messages';

const WHATSAPP_URL = 'https://web.whatsapp.com/';

async function getWhatsAppTabId(): Promise<number | null> {
  const tabs = await chrome.tabs.query({ url: `${WHATSAPP_URL}*` });
  return tabs[0]?.id ?? null;
}

async function sendToContentScript<T>(
  request: WhatsAppActionRequest,
): Promise<T> {
  const tabId = await getWhatsAppTabId();
  if (!tabId) {
    throw new Error('WhatsApp Web tab not found');
  }

  const response = (await chrome.tabs.sendMessage(tabId, {
    type: 'WHATSAPP_ACTION',
    payload: request,
  })) as WhatsAppActionResponse;

  if (!response.success) {
    throw new Error(response.error ?? 'WhatsApp action failed');
  }

  return response.data as T;
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

  async send(chatId: string, text: string): Promise<SendResult> {
    try {
      await sendToContentScript({ action: 'send', chatId, text });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Send failed' };
    }
  }

  async getRecentMessages(chatId: string, limit: number): Promise<ConversationMessage[]> {
    return sendToContentScript<ConversationMessage[]>({
      action: 'getMessages',
      chatId,
      limit,
    });
  }

  async getContactInfo(chatId: string): Promise<ContactInfo | null> {
    return sendToContentScript<ContactInfo | null>({
      action: 'getContact',
      chatId,
    });
  }

  async getActiveChatId(): Promise<string | null> {
    return sendToContentScript<string | null>({ action: 'getActiveChat' });
  }
}
