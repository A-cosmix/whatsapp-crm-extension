export async function sendRuntimeMessage<T>(type: string, payload?: unknown): Promise<T> {
  const response = await chrome.runtime.sendMessage({ type, payload });
  if (!response?.success) {
    throw new Error(response?.error ?? 'Request failed');
  }
  return response.data as T;
}

export function onRuntimeMessage<T>(
  type: string,
  handler: (payload: T) => void,
): () => void {
  const listener = (
    message: { type?: string; payload?: T },
    _sender: chrome.runtime.MessageSender,
    _sendResponse: (response?: unknown) => void,
  ) => {
    if (message?.type === type && message.payload !== undefined) {
      handler(message.payload);
    }
  };

  chrome.runtime.onMessage.addListener(listener);
  return () => chrome.runtime.onMessage.removeListener(listener);
}
