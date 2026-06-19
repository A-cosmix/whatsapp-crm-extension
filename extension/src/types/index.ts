export type ExplanationMode =
  | 'whatsapp'
  | 'child'
  | 'hindi'
  | 'genz'
  | 'teacher'
  | 'interview'
  | 'exam-notes'
  | 'five-point'
  | 'friend'
  | 'gamer'
  | 'mom'
  | 'meme';

export interface ExplanationModeConfig {
  id: ExplanationMode;
  name: string;
  emoji: string;
  description: string;
  isPremium: boolean;
}

export const EXPLANATION_MODES: ExplanationModeConfig[] = [
  { id: 'whatsapp', name: 'WhatsApp Mode', emoji: '💬', description: 'Explain like a WhatsApp message', isPremium: false },
  { id: 'child', name: 'Child Mode', emoji: '👶', description: 'Explain like talking to a 5-year-old', isPremium: false },
  { id: 'hindi', name: 'Hindi Mode', emoji: '🇮🇳', description: 'Simple Hindi explanation', isPremium: false },
  { id: 'genz', name: 'GenZ Mode', emoji: '🔥', description: 'No cap, explain it fr fr', isPremium: true },
  { id: 'teacher', name: 'Teacher Mode', emoji: '👨‍🏫', description: 'Patient teacher explanation', isPremium: true },
  { id: 'interview', name: 'Interview Mode', emoji: '💼', description: 'How to explain in interviews', isPremium: true },
  { id: 'exam-notes', name: 'Exam Notes Mode', emoji: '📝', description: 'Exam-ready bullet points', isPremium: true },
  { id: 'five-point', name: '5-Point Summary', emoji: '5️⃣', description: '5 key points only', isPremium: true },
  { id: 'friend', name: 'Explain Like Friend', emoji: '🤝', description: 'Your best friend explaining', isPremium: false },
  { id: 'gamer', name: 'Explain Like Gamer', emoji: '🎮', description: 'Gaming analogies everywhere', isPremium: true },
  { id: 'mom', name: 'Explain Like Mom', emoji: '👩', description: 'Caring mom explanation', isPremium: true },
  { id: 'meme', name: 'Meme Mode', emoji: '😂', description: 'Meme-style funny explanation', isPremium: true },
];

export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'none';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: number;
  trialStartDate: number;
  trialEndDate: number;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiry?: number;
  razorpaySubscriptionId?: string;
  dailyExplanationCount: number;
  lastExplanationDate: string;
  streak: number;
  longestStreak: number;
  totalExplanations: number;
  achievements: string[];
  preferredMode: ExplanationMode;
  preferredLanguage: string;
  darkMode: boolean;
  onboardingComplete: boolean;
}

export interface ExplanationRecord {
  id: string;
  originalText: string;
  explanation: string;
  mode: ExplanationMode;
  url: string;
  pageTitle: string;
  timestamp: number;
  cached: boolean;
}

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  sourceUrl: string;
  type: 'exam-notes' | 'flashcards' | 'revision' | 'summary';
  createdAt: number;
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  snippet: string;
  createdAt: number;
}

export interface DailyLearningReport {
  date: string;
  topicsLearned: string[];
  websitesVisited: string[];
  explanationsCount: number;
  modesUsed: Record<string, number>;
  streak: number;
}

export interface UserSettings {
  defaultMode: ExplanationMode;
  language: string;
  shortcutEnabled: boolean;
  wordExplainerEnabled: boolean;
  focusModeEnabled: boolean;
  darkMode: boolean;
  readingFont: 'sans' | 'serif' | 'mono';
  focusTimerMinutes: number;
  notificationsEnabled: boolean;
  analyticsEnabled: boolean;
}

export interface AnalyticsEvent {
  name: string;
  properties: Record<string, string | number | boolean>;
  timestamp: number;
  userId?: string;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  status: 'created' | 'paid' | 'failed';
  createdAt: number;
}

export type BackendPlan = 'pro' | 'trial' | 'expired' | 'free' | 'unknown';

/** Normalized response from the Google Sheets / Apps Script backend. */
export interface BackendStatus {
  ok: boolean;
  pro: boolean;
  plan: BackendPlan;
  expiry: number | null;
  paymentId?: string;
  trial: {
    used: boolean;
    start: number | null;
    end: number | null;
    /** Email that originally registered the trial on this device, if any. */
    ownerEmail?: string;
  };
  error?: string;
}

export interface Achievement {
  id: string;
  name: string;
  emoji: string;
  description: string;
  requirement: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-explain', name: 'First Lightbulb', emoji: '💡', description: 'First explanation', requirement: 1 },
  { id: 'streak-3', name: '3-Day Streak', emoji: '🔥', description: '3 day learning streak', requirement: 3 },
  { id: 'streak-7', name: 'Week Warrior', emoji: '⚡', description: '7 day learning streak', requirement: 7 },
  { id: 'streak-30', name: 'Monthly Master', emoji: '🏆', description: '30 day learning streak', requirement: 30 },
  { id: 'explain-10', name: 'Curious Mind', emoji: '🧠', description: '10 explanations', requirement: 10 },
  { id: 'explain-50', name: 'Knowledge Seeker', emoji: '📚', description: '50 explanations', requirement: 50 },
  { id: 'explain-100', name: 'Scholar', emoji: '🎓', description: '100 explanations', requirement: 100 },
  { id: 'all-modes', name: 'Mode Explorer', emoji: '🌈', description: 'Try all explanation modes', requirement: 12 },
  { id: 'pdf-master', name: 'PDF Master', emoji: '📄', description: 'Summarize 5 PDFs', requirement: 5 },
  { id: 'youtube-guru', name: 'YouTube Guru', emoji: '📺', description: 'Summarize 5 videos', requirement: 5 },
];

export const FREE_TRIAL_DAYS = 5;
export const FREE_DAILY_LIMIT = 30;
export const FREE_EXPIRED_DAILY_LIMIT = 5;
export const PAID_PLAN_PRICE_INR = 150;
export const CACHE_TTL_DAYS = 30;

export type MessageType =
  | 'PING'
  | 'EXPLAIN_TEXT'
  | 'EXPLAIN_WORD'
  | 'GENERATE_NOTES'
  | 'SUMMARIZE_PDF'
  | 'SUMMARIZE_YOUTUBE'
  | 'GET_USER'
  | 'CHECK_USAGE'
  | 'TRACK_EVENT'
  | 'GET_CACHED'
  | 'CLEAR_CACHE'
  | 'EXPORT_DATA'
  | 'VERIFY_PAYMENT'
  | 'CREATE_PAYMENT_ORDER'
  | 'GET_DAILY_REPORT'
  | 'SHARE_EXPLANATION'
  | 'SYNC_ACCOUNT';

export interface ExtensionMessage {
  type: MessageType;
  payload?: Record<string, unknown>;
}

export interface ExplainTextPayload {
  text: string;
  mode: ExplanationMode;
  url: string;
  pageTitle: string;
}

export interface ExplainWordPayload {
  word: string;
  context: string;
}

export interface GenerateNotesPayload {
  content: string;
  type: StudyNote['type'];
  url: string;
  title: string;
}

export interface YouTubeSummaryPayload {
  videoTitle: string;
  videoUrl: string;
  transcript?: string;
  mode: ExplanationMode;
}

export interface PdfSummaryPayload {
  text: string;
  url: string;
  mode: ExplanationMode;
  action: 'summarize' | 'notes' | 'explain';
}
