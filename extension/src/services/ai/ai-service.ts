import { explainWithCosmiQ } from './huggingface-service';
import type { WordExplanation } from './claude-service';

// CosmiQ (free, Hugging Face) is the only AI engine. There is intentionally no
// provider switch — every explanation goes through CosmiQ.

export async function explainText(prompt: string): Promise<string> {
  return explainWithCosmiQ(prompt);
}

export async function explainWord(prompt: string): Promise<WordExplanation> {
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
}

export async function generateNotes(prompt: string): Promise<string> {
  return explainWithCosmiQ(prompt);
}

export async function summarizeContent(prompt: string): Promise<string> {
  return explainWithCosmiQ(prompt);
}

export { hashText } from './claude-service';
