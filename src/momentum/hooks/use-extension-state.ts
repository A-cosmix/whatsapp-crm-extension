import { useCallback, useEffect, useState } from 'react';
import { MessageTypes, sendMessage, type ExtensionState } from '../lib/messages';

export function useExtensionState() {
  const [state, setState] = useState<ExtensionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await sendMessage<ExtensionState>(MessageTypes.GET_STATE);
      setState(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const listener = (message: { type: string; payload?: ExtensionState }) => {
      if (message.type === MessageTypes.STATE_CHANGED && message.payload) {
        setState(message.payload);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [refresh]);

  return { state, loading, error, refresh };
}
