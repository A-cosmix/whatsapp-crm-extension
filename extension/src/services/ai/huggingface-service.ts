import { Client } from '@gradio/client';

const DEFAULT_SPACE = 'JNX25/cosmiq-ai-assistant';

let clientPromise: ReturnType<typeof Client.connect> | null = null;

async function getSpaceId(): Promise<string> {
  const result = await chrome.storage.local.get('hfSpaceId');
  return (result.hfSpaceId as string) || import.meta.env.VITE_HF_SPACE_ID || DEFAULT_SPACE;
}

async function getClient() {
  const spaceId = await getSpaceId();
  if (!clientPromise) {
    clientPromise = Client.connect(spaceId);
  }
  return clientPromise;
}

function parseGradioResponse(data: unknown): string {
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return String(data[0] ?? '');
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (typeof obj.response === 'string') return obj.response;
    if (typeof obj.text === 'string') return obj.text;
  }
  return String(data ?? 'No response from CosmiQ AI');
}

export async function callCosmiQ(message: string): Promise<string> {
  try {
    const client = await getClient();
    const result = await client.predict('/chat_with_cosmiq', { message });
    return parseGradioResponse(result.data);
  } catch (err) {
    // Reset client on error (space may have slept)
    clientPromise = null;
    if (err instanceof Error && err.message.includes('fetch')) {
      throw new Error('CosmiQ AI is waking up. Please try again in 30 seconds.');
    }
    throw err instanceof Error ? err : new Error('CosmiQ AI request failed');
  }
}

export async function explainWithCosmiQ(prompt: string): Promise<string> {
  return callCosmiQ(prompt);
}

export async function resetCosmiQClient(): Promise<void> {
  clientPromise = null;
}
