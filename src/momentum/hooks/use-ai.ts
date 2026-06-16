import { useState, useCallback } from 'react';
import { MessageTypes, sendMessage } from '../lib/messages';
import type { ChatMessage } from '../types';

export function useAIChat(initialMessages: ChatMessage[] = []) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await sendMessage<{ messages: ChatMessage[] }>(MessageTypes.AI_CHAT, {
        messages,
        userMessage: text.trim(),
      });
      setMessages(result.messages);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI request failed');
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const clear = useCallback(() => setMessages([]), []);

  return { messages, loading, error, send, clear, setMessages };
}

export async function runAIAction(
  type: 'summarize' | 'rewrite' | 'explain' | 'reply' | 'suggest',
  input: string,
  context?: string,
): Promise<string> {
  return sendMessage<string>(MessageTypes.AI_ACTION, { type, input, context });
}
