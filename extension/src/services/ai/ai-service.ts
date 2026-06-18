import { explainText as claudeExplain, explainWord as claudeWord, generateNotes as claudeNotes, summarizeContent as claudeSummarize } from './claude-service';
import { explainWithCosmiQ } from './huggingface-service';
import type { WordExplanation } from './claude-service';

export type AIProvider = 'cosmiq' | 'claude';

export async function getAIProvider(): Promise<AIProvider> {
  const result = await chrome.storage.local.get('aiProvider');
  return (result.aiProvider as AIProvider) || 'cosmiq';
}

export async function setAIProvider(provider: AIProvider): Promise<void> {
  await chrome.storage.local.set({ aiProvider: provider });
}

async function withProvider<T>(cosmiqFn: () => Promise<T>, claudeFn: () => Promise<T>): Promise<T> {
  const provider = await getAIProvider();
  if (provider === 'claude') {
    return claudeFn();
  }
  return cosmiqFn();
}

export async function explainText(prompt: string): Promise<string> {
  return withProvider(
    () => explainWithCosmiQ(prompt),
    () => claudeExplain(prompt),
  );
}

export async function explainWord(prompt: string): Promise<WordExplanation> {
  return withProvider(
    async () => {
      const response = await explainWithCosmiQ(prompt);
      try {
        const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
          meaning: parsed.meaning || response,
          pronunciation: parsed.pronunciation || '',
          hindiMeaning: parsed.hindiMeaning || '',
          simpleExplanation: parsed.simpleExplanation || response,
        };
      } catch {
        return { meaning: response, pronunciation: '', hindiMeaning: '', simpleExplanation: response };
      }
    },
    () => claudeWord(prompt),
  );
}

export async function generateNotes(prompt: string): Promise<string> {
  return withProvider(
    () => explainWithCosmiQ(prompt),
    () => claudeNotes(prompt),
  );
}

export async function summarizeContent(prompt: string): Promise<string> {
  return withProvider(
    () => explainWithCosmiQ(prompt),
    () => claudeSummarize(prompt),
  );
}

export { hashText } from './claude-service';
