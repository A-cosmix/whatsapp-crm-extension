/**
 * Claude API integration for email analysis.
 * Uses structured JSON responses validated with Zod.
 */

import { z } from 'zod';
import type {
  ApiError,
  ApiUsageStats,
  EmailAnalysis,
  ParsedEmail,
  SmartReplies,
  SummaryLength,
  UserPreferences,
} from '@/types';
import { DEFAULT_PREFERENCES } from '@/types';
import { hashBody } from '@/utils/storage';

const API_URL = 'https://api.anthropic.com/v1/messages';
const API_VERSION = '2023-06-01';
const MODEL = 'claude-opus-4-6';
const REQUEST_TIMEOUT_MS = 10_000;

const AnalysisSchema = z.object({
  summary: z.array(z.string()).min(1).max(5),
  priority: z.enum(['Important', 'Routine', 'Low Priority']),
  sentiment: z.enum(['Positive', 'Neutral', 'Urgent', 'Frustrated', 'Negative']),
  needsFollowUp: z.boolean(),
  meeting: z
    .object({
      date: z.string().optional(),
      time: z.string().optional(),
      attendees: z.array(z.string()).default([]),
      agenda: z.string().optional(),
      meetingLink: z.string().optional(),
    })
    .optional()
    .nullable(),
  smartReplies: z
    .object({
      formal: z.string(),
      casual: z.string(),
      urgent: z.string(),
    })
    .optional()
    .nullable(),
});

type AnalysisResult = z.infer<typeof AnalysisSchema>;

function buildAnalysisPrompt(email: ParsedEmail, summaryLength: SummaryLength): string {
  const lengthInstruction =
    summaryLength === 'brief'
      ? 'Summarize in exactly 2-3 concise bullet points.'
      : 'Summarize in 4-6 detailed bullet points covering all key points.';

  return `You are an email assistant. Analyze the following email and respond with ONLY valid JSON (no markdown, no code fences).

Required JSON structure:
{
  "summary": ["bullet 1", "bullet 2"],
  "priority": "Important" | "Routine" | "Low Priority",
  "sentiment": "Positive" | "Neutral" | "Urgent" | "Frustrated" | "Negative",
  "needsFollowUp": true/false,
  "meeting": {
    "date": "extracted date or null",
    "time": "extracted time or null",
    "attendees": ["name1", "name2"],
    "agenda": "meeting agenda or null",
    "meetingLink": "zoom/teams/meet link or null"
  },
  "smartReplies": {
    "formal": "1-2 sentence formal reply",
    "casual": "1-2 sentence casual reply",
    "urgent": "1-2 sentence urgent reply"
  }
}

Rules:
- ${lengthInstruction}
- Classify priority: Important (action required, deadlines, boss/clients), Routine (normal work), Low Priority (newsletters, FYI)
- Detect meetings from keywords: meeting, call, sync, standup, zoom, teams
- needsFollowUp: true if email asks a question or expects a response
- If no meeting detected, set meeting to null
- smartReplies: generate 3 distinct reply options

Email:
From: ${email.sender} <${email.senderEmail}>
Subject: ${email.subject}
Date: ${email.date ?? 'Unknown'}

Body:
${email.body.slice(0, 8000)}`;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseApiError(status: number, body: string): ApiError {
  if (status === 401) {
    return { code: 'INVALID_KEY', message: 'Invalid API key. Please check your settings.' };
  }
  if (status === 429) {
    return { code: 'RATE_LIMIT', message: 'Rate limit reached. Please wait a moment and try again.' };
  }
  if (status >= 500) {
    return { code: 'NETWORK', message: 'Claude API is temporarily unavailable. Try again later.' };
  }

  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } };
    return {
      code: 'UNKNOWN',
      message: parsed.error?.message ?? 'Something went wrong. Please try again.',
    };
  } catch {
    return { code: 'UNKNOWN', message: 'Something went wrong. Please try again.' };
  }
}

function extractJsonFromResponse(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start !== -1 && end !== -1) return trimmed.slice(start, end + 1);

  return trimmed;
}

export async function callClaudeApi(
  apiKey: string,
  prompt: string,
  maxTokens = 500,
): Promise<{ text: string; usage: { input_tokens: number; output_tokens: number } }> {
  let response: Response;

  try {
    response = await fetchWithTimeout(
      API_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': API_VERSION,
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }],
        }),
      },
      REQUEST_TIMEOUT_MS,
    );
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw { code: 'TIMEOUT', message: 'Request timed out after 10 seconds.' } satisfies ApiError;
    }
    throw { code: 'NETWORK', message: 'Network error. Check your connection.' } satisfies ApiError;
  }

  const body = await response.text();

  if (!response.ok) {
    throw parseApiError(response.status, body);
  }

  const parsed = JSON.parse(body) as {
    content: Array<{ type: string; text?: string }>;
    usage?: { input_tokens: number; output_tokens: number };
  };

  const text = parsed.content.find((c) => c.type === 'text')?.text ?? '';
  const usage = parsed.usage ?? { input_tokens: 0, output_tokens: 0 };

  return { text, usage };
}

export async function validateApiKey(apiKey: string): Promise<{
  valid: boolean;
  error?: ApiError;
  usage?: { input_tokens: number; output_tokens: number };
}> {
  if (!apiKey || apiKey.length < 10) {
    return { valid: false, error: { code: 'INVALID_KEY', message: 'API key is too short.' } };
  }

  try {
    const { usage } = await callClaudeApi(apiKey, 'Reply with exactly: OK', 10);
    return { valid: true, usage };
  } catch (err) {
    return { valid: false, error: err as ApiError };
  }
}

export async function analyzeEmail(
  email: ParsedEmail,
  preferences: UserPreferences,
): Promise<EmailAnalysis> {
  const prompt = buildAnalysisPrompt(email, preferences.summaryLength);
  const { text, usage } = await callClaudeApi(preferences.apiKey, prompt, 800);

  await updateApiUsage(usage.input_tokens, usage.output_tokens);

  let parsed: AnalysisResult;
  try {
    const jsonStr = extractJsonFromResponse(text);
    parsed = AnalysisSchema.parse(JSON.parse(jsonStr));
  } catch {
    throw {
      code: 'PARSE_ERROR',
      message: 'Could not parse AI response. Showing cached or original content.',
    } satisfies ApiError;
  }

  const bodyHash = await hashBody(email.body);

  const analysis: EmailAnalysis = {
    id: email.id,
    subject: email.subject,
    sender: email.sender,
    summary: parsed.summary,
    priority: preferences.features.priority ? parsed.priority : 'Routine',
    sentiment: preferences.features.sentiment ? parsed.sentiment : 'Neutral',
    needsFollowUp: preferences.features.followUp ? parsed.needsFollowUp : false,
    analyzedAt: Date.now(),
    bodyHash,
    platform: email.platform,
  };

  if (preferences.features.meetingExtractor && parsed.meeting) {
    analysis.meeting = {
      date: parsed.meeting.date,
      time: parsed.meeting.time,
      attendees: parsed.meeting.attendees ?? [],
      agenda: parsed.meeting.agenda,
      meetingLink: parsed.meeting.meetingLink,
    };
  }

  if (preferences.features.smartReply && parsed.smartReplies) {
    analysis.smartReplies = parsed.smartReplies as SmartReplies;
  }

  if (!preferences.features.summarization) {
    analysis.summary = ['Summarization is disabled in settings.'];
  }

  return analysis;
}

export async function generateWeeklyDigestText(
  apiKey: string,
  emails: EmailAnalysis[],
): Promise<string> {
  const emailSummaries = emails
    .map(
      (e, i) =>
        `${i + 1}. [${e.priority}] From: ${e.sender} | Subject: ${e.subject}\n   Summary: ${e.summary.join('; ')}`,
    )
    .join('\n');

  const prompt = `Create a weekly email digest report based on these ${emails.length} analyzed emails from the past week.

Include:
1. Executive summary (2-3 sentences)
2. Most important emails (top 5)
3. Top senders by volume
4. Action items requiring follow-up
5. Upcoming meetings detected

Emails:
${emailSummaries.slice(0, 15000)}

Format as a clean, readable email draft the user can send to themselves.`;

  const { text } = await callClaudeApi(apiKey, prompt, 1500);
  return text;
}

const USAGE_STORAGE_KEY = 'apiUsageStats';

export async function getApiUsage(): Promise<ApiUsageStats> {
  const result = await chrome.storage.local.get(USAGE_STORAGE_KEY);
  return (
    (result[USAGE_STORAGE_KEY] as ApiUsageStats) ?? {
      lastInputTokens: 0,
      lastOutputTokens: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      lastRequestAt: 0,
    }
  );
}

async function updateApiUsage(inputTokens: number, outputTokens: number): Promise<void> {
  const current = await getApiUsage();
  const updated: ApiUsageStats = {
    lastInputTokens: inputTokens,
    lastOutputTokens: outputTokens,
    totalInputTokens: current.totalInputTokens + inputTokens,
    totalOutputTokens: current.totalOutputTokens + outputTokens,
    lastRequestAt: Date.now(),
  };
  await chrome.storage.local.set({ [USAGE_STORAGE_KEY]: updated });
}

export async function getPreferences(): Promise<UserPreferences> {
  const result = await chrome.storage.sync.get('preferences');
  const stored = result.preferences as Partial<UserPreferences> | undefined;

  if (!stored) return { ...DEFAULT_PREFERENCES };

  return {
    ...DEFAULT_PREFERENCES,
    ...stored,
    features: { ...DEFAULT_PREFERENCES.features, ...stored.features },
    shortcuts: { ...DEFAULT_PREFERENCES.shortcuts, ...stored.shortcuts },
  };
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  await chrome.storage.sync.set({ preferences: prefs });
}
