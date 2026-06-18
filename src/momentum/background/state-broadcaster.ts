import { MessageTypes } from '../lib/messages';
import { getFullState } from '../services/storage';

export async function broadcastState(): Promise<void> {
  const state = await getFullState();
  try {
    await chrome.runtime.sendMessage({ type: MessageTypes.STATE_CHANGED, payload: state });
  } catch {
    // No listeners — expected when no UI is open
  }
}
