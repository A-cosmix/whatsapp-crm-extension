/** Core type definitions for the AI Email Summarizer extension */

export type Priority = 'Important' | 'Routine' | 'Low Priority';

export type Sentiment =
  | 'Positive'
  | 'Neutral'
  | 'Urgent'
  | 'Frustrated'
  | 'Negative';

export type SummaryLength = 'brief' | 'detailed';

export type EmailPlatform = 'gmail' | 'outlook';

export interface MeetingInfo {
  date?: string;
  time?: string;
  attendees: string[];
  agenda?: string;
  meetingLink?: string;
}

export interface SmartReplies {
  formal: string;
  casual: string;
  urgent: string;
}

export interface EmailAnalysis {
  id: string;
  subject: string;
  sender: string;
  summary: string[];
  priority: Priority;
  sentiment: Sentiment;
  needsFollowUp: boolean;
  meeting?: MeetingInfo;
  smartReplies?: SmartReplies;
  analyzedAt: number;
  bodyHash: string;
  platform: EmailPlatform;
}

export interface FeatureToggles {
  summarization: boolean;
  priority: boolean;
  meetingExtractor: boolean;
  followUp: boolean;
  smartReply: boolean;
  sentiment: boolean;
  snooze: boolean;
  weeklyDigest: boolean;
}

export interface UserPreferences {
  apiKey: string;
  features: FeatureToggles;
  summaryLength: SummaryLength;
  weeklyDigestDay: number;
  weeklyDigestHour: number;
  weeklyDigestMinute: number;
  excludedSenders: string[];
  darkMode: 'system' | 'light' | 'dark';
  shortcuts: KeyboardShortcuts;
}

export type ShortcutAction = keyof KeyboardShortcuts;

export interface KeyboardShortcuts {
  summarize: string;
  togglePanel: string;
  smartReply: string;
  quickSnooze: string;
}

export interface SnoozeReminder {
  id: string;
  emailId: string;
  subject: string;
  sender: string;
  snoozedAt: number;
  resurfaceAt: number;
  platform: EmailPlatform;
}

export interface WeeklyDigest {
  generatedAt: number;
  weekStart: number;
  weekEnd: number;
  importantEmails: Pick<EmailAnalysis, 'subject' | 'sender' | 'summary' | 'priority'>[];
  topSenders: { sender: string; count: number }[];
  actionItems: string[];
  totalEmails: number;
  digestText: string;
}

export interface ApiUsageStats {
  lastInputTokens: number;
  lastOutputTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  lastRequestAt: number;
}

export interface ParsedEmail {
  id: string;
  subject: string;
  sender: string;
  senderEmail: string;
  body: string;
  date?: string;
  platform: EmailPlatform;
}

export type MessageType =
  | 'ANALYZE_EMAIL'
  | 'GET_CACHED_ANALYSIS'
  | 'VALIDATE_API_KEY'
  | 'GET_PREFERENCES'
  | 'SAVE_PREFERENCES'
  | 'SNOOZE_EMAIL'
  | 'GET_SNOOZED'
  | 'CANCEL_SNOOZE'
  | 'GENERATE_WEEKLY_DIGEST'
  | 'GET_API_USAGE'
  | 'SEARCH_SUMMARIES'
  | 'GET_ALL_ANALYSES'
  | 'GET_ONBOARDING'
  | 'SAVE_ONBOARDING'
  | 'RESET_ONBOARDING'
  | 'START_EMAIL_TOUR';

export interface ExtensionMessage<T = unknown> {
  type: MessageType;
  payload?: T;
}

export interface AnalyzeEmailPayload {
  email: ParsedEmail;
  forceRefresh?: boolean;
}

export interface SnoozePayload {
  emailId: string;
  subject: string;
  sender: string;
  platform: EmailPlatform;
  durationMs: number;
}

export interface ApiError {
  code: 'INVALID_KEY' | 'RATE_LIMIT' | 'NETWORK' | 'TIMEOUT' | 'PARSE_ERROR' | 'UNKNOWN';
  message: string;
}

export interface OnboardingState {
  popupCompleted: boolean;
  emailTourCompleted: boolean;
  completedAt?: number;
  skipped: boolean;
}

export const DEFAULT_ONBOARDING: OnboardingState = {
  popupCompleted: false,
  emailTourCompleted: false,
  skipped: false,
};

export interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  apiKey: '',
  features: {
    summarization: true,
    priority: true,
    meetingExtractor: true,
    followUp: true,
    smartReply: true,
    sentiment: true,
    snooze: true,
    weeklyDigest: true,
  },
  summaryLength: 'brief',
  weeklyDigestDay: 0,
  weeklyDigestHour: 9,
  weeklyDigestMinute: 0,
  excludedSenders: [],
  darkMode: 'system',
  shortcuts: {
    summarize: 'Alt+S',
    togglePanel: 'Alt+P',
    smartReply: 'Alt+R',
    quickSnooze: 'Alt+Z',
  },
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  Important: '#ef4444',
  Routine: '#3b82f6',
  'Low Priority': '#9ca3af',
};

export const SENTIMENT_EMOJI: Record<Sentiment, string> = {
  Positive: '😊',
  Neutral: '😐',
  Urgent: '⚡',
  Frustrated: '😤',
  Negative: '😟',
};

export const SENTIMENT_COLORS: Record<Sentiment, string> = {
  Positive: '#22c55e',
  Neutral: '#eab308',
  Urgent: '#ef4444',
  Frustrated: '#f97316',
  Negative: '#ef4444',
};

export const SNOOZE_OPTIONS = [
  { label: '1 hour', ms: 60 * 60 * 1000 },
  { label: '4 hours', ms: 4 * 60 * 60 * 1000 },
  { label: '1 day', ms: 24 * 60 * 60 * 1000 },
  { label: '3 days', ms: 3 * 24 * 60 * 60 * 1000 },
  { label: '1 week', ms: 7 * 24 * 60 * 60 * 1000 },
] as const;
