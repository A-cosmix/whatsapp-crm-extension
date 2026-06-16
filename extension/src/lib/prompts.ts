import type { ExplanationMode } from '@/types';

export const MODE_PROMPTS: Record<ExplanationMode, string> = {
  whatsapp: `Explain this in WhatsApp chat style - casual, friendly, use Hinglish if helpful, add relevant emojis. Keep it short like a real WhatsApp message. Example style: "Matlab system ka koi single owner nahi hota 😄 sab log milke control karte hain."`,

  child: `Explain this like you're talking to a 5-year-old child. Use simple words, fun analogies, and make it easy to understand. No jargon at all.`,

  hindi: `Explain this in simple Hindi (Devanagari script). Use everyday language that any Indian person can understand. Mix English technical terms only when necessary with Hindi explanation.`,

  genz: `Explain this in GenZ style - use current slang, be relatable, say things like "no cap", "fr fr", "lowkey", "highkey". Keep it fun and authentic but still educational.`,

  teacher: `Explain this like a patient, caring teacher would to a student. Break it down step by step, use examples, and make sure the concept is crystal clear.`,

  interview: `Explain this as if preparing someone for a job interview. Focus on how to articulate this concept clearly and confidently in 2-3 sentences. Include key points to mention.`,

  'exam-notes': `Convert this into exam-ready notes. Use bullet points, highlight key terms, include definitions, and make it easy to revise quickly before an exam.`,

  'five-point': `Explain this in exactly 5 clear bullet points. Each point should be one sentence. No more, no less.`,

  friend: `Explain this like your best friend would over chai. Casual, relatable, maybe a bit funny, but genuinely helpful.`,

  gamer: `Explain this using gaming analogies and references. Think video games, levels, power-ups, boss fights. Make learning feel like a game.`,

  mom: `Explain this like a caring Indian mom would - warm, patient, with real-life examples from daily life. Add a touch of "beta, samjha?" energy.`,

  meme: `Explain this in meme style - funny, relatable, use internet humor. Can reference popular memes but keep the explanation accurate.`,
};

export function buildExplainPrompt(text: string, mode: ExplanationMode): string {
  const modeInstruction = MODE_PROMPTS[mode];
  return `You are "Explain Like WhatsApp" - an AI that makes the internet simple for everyone.

TASK: Simplify and explain the following text.

STYLE: ${modeInstruction}

RULES:
- NEVER sound robotic or like an AI
- Keep it SHORT (under 150 words unless exam-notes mode)
- Remove ALL unnecessary jargon
- Make it feel human, warm, and relatable
- If the text is in another language, explain in the user's preferred style
- Do NOT add disclaimers or meta-commentary
- Just give the explanation directly

TEXT TO EXPLAIN:
"""
${text}
"""`;
}

export function buildWordPrompt(word: string, context: string): string {
  return `Explain the word "${word}" in this context: "${context}"

Provide a JSON response with exactly this structure:
{
  "meaning": "simple English meaning in one sentence",
  "pronunciation": "phonetic pronunciation guide",
  "hindiMeaning": "Hindi meaning in Devanagari",
  "simpleExplanation": "explain like talking to a friend in 2 sentences"
}

Return ONLY valid JSON, no markdown.`;
}

export function buildNotesPrompt(content: string, type: string): string {
  const typeInstructions: Record<string, string> = {
    'exam-notes': 'Create comprehensive exam notes with headings, bullet points, key definitions, and important points to remember.',
    flashcards: 'Create 10 flashcards in format "Q: question\\nA: answer" separated by "---".',
    revision: 'Create a quick revision sheet with only the most important points for last-minute review.',
    summary: 'Create a concise summary in 3 paragraphs maximum.',
  };

  return `Convert this content into ${type}:

${typeInstructions[type] || typeInstructions.summary}

CONTENT:
"""
${content.slice(0, 8000)}
"""`;
}

export function buildYouTubePrompt(title: string, transcript: string, mode: ExplanationMode): string {
  return `Summarize and explain this YouTube video.

Video Title: ${title}

${MODE_PROMPTS[mode]}

Also provide:
1. A brief summary (3-4 sentences)
2. Key concepts explained simply
3. Suggested timestamps with topics (estimate based on content flow)
4. Study notes for revision

TRANSCRIPT/CONTENT:
"""
${transcript.slice(0, 10000)}
"""`;
}

export function buildPdfPrompt(text: string, mode: ExplanationMode, action: string): string {
  const actionPrompts: Record<string, string> = {
    summarize: 'Provide a comprehensive summary of this PDF content.',
    notes: 'Create detailed study notes from this PDF content.',
    explain: `Explain the difficult parts of this PDF content. ${MODE_PROMPTS[mode]}`,
  };

  return `${actionPrompts[action] || actionPrompts.summarize}

${MODE_PROMPTS[mode]}

PDF CONTENT:
"""
${text.slice(0, 12000)}
"""`;
}
