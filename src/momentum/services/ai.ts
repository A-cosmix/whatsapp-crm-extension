import type { AIAction, AppSettings, ChatMessage } from '../types';
import { getSettings } from './storage';

interface OpenAIResponse {
  choices: Array<{ message: { content: string } }>;
}

const SYSTEM_PROMPT = `You are Momentum X, an elite AI productivity assistant built into a Chrome extension.
You help users stay focused, organized, and productive. Be concise, actionable, and insightful.
When summarizing, use bullet points. When suggesting productivity improvements, be specific.`;

const ACTION_PROMPTS: Record<AIAction['type'], string> = {
  summarize: 'Summarize the following content concisely with key bullet points:',
  rewrite: 'Rewrite the following text to be clearer and more professional while preserving meaning:',
  explain: 'Explain the following code or technical content in simple terms:',
  reply: 'Suggest 3 smart, contextual reply options for this message:',
  suggest: 'Based on the user context, provide 3 actionable productivity suggestions:',
};

async function callOpenAI(
  settings: AppSettings,
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  if (!settings.apiKey) {
    throw new Error('OpenAI API key not configured. Go to Settings to add your key.');
  }

  const response = await fetch(`${settings.apiBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI request failed: ${response.status} ${err}`);
  }

  const data = (await response.json()) as OpenAIResponse;
  return data.choices[0]?.message?.content ?? 'No response generated.';
}

export async function chat(messages: ChatMessage[]): Promise<string> {
  const settings = await getSettings();
  const apiMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];
  return callOpenAI(settings, apiMessages);
}

export async function executeAction(action: AIAction): Promise<string> {
  const settings = await getSettings();
  const prompt = ACTION_PROMPTS[action.type];
  const content = action.context
    ? `${prompt}\n\nContext: ${action.context}\n\nContent:\n${action.input}`
    : `${prompt}\n\n${action.input}`;

  return callOpenAI(settings, [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content },
  ]);
}

export async function summarizePage(title: string, content: string): Promise<string> {
  return executeAction({
    type: 'summarize',
    input: content.slice(0, 8000),
    context: `Page title: ${title}`,
  });
}

export async function summarizeYouTube(title: string, description: string): Promise<string> {
  return executeAction({
    type: 'summarize',
    input: description || title,
    context: `YouTube video: ${title}. Provide a summary with key points and takeaways.`,
  });
}

export async function getProductivitySuggestions(
  goals: string[],
  analytics: string,
): Promise<string> {
  return executeAction({
    type: 'suggest',
    input: `Today's goals: ${goals.join(', ') || 'none set'}. Recent browsing: ${analytics}`,
  });
}
