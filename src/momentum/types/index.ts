export type ThemeMode = 'dark' | 'light' | 'system';
export type AccentTheme = 'electric' | 'neon' | 'cyan' | 'emerald' | 'rose';

export interface AppSettings {
  apiKey: string;
  apiBaseUrl: string;
  model: string;
  theme: ThemeMode;
  accent: AccentTheme;
  onboardingComplete: boolean;
  floatingAssistant: boolean;
  voiceEnabled: boolean;
  notificationsEnabled: boolean;
  dailyGoalTarget: number;
  focusDuration: number;
  breakDuration: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
}

export interface DailyGoal {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface FocusSession {
  id: string;
  duration: number;
  completedAt: number;
  type: 'focus' | 'break';
}

export interface TimerState {
  isRunning: boolean;
  isBreak: boolean;
  remaining: number;
  startedAt: number | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Reminder {
  id: string;
  title: string;
  body: string;
  scheduledAt: number;
  completed: boolean;
}

export interface PageAnalytics {
  domain: string;
  totalTime: number;
  visits: number;
  lastVisit: number;
}

export interface AIAction {
  type: 'summarize' | 'rewrite' | 'explain' | 'reply' | 'suggest';
  input: string;
  context?: string;
}

export interface StorageData {
  settings: AppSettings;
  notes: Note[];
  goals: DailyGoal[];
  focusSessions: FocusSession[];
  timer: TimerState;
  chatHistory: ChatMessage[];
  reminders: Reminder[];
  analytics: PageAnalytics[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  apiBaseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  theme: 'dark',
  accent: 'electric',
  onboardingComplete: false,
  floatingAssistant: true,
  voiceEnabled: true,
  notificationsEnabled: true,
  dailyGoalTarget: 5,
  focusDuration: 25,
  breakDuration: 5,
};

export const DEFAULT_TIMER: TimerState = {
  isRunning: false,
  isBreak: false,
  remaining: 25 * 60,
  startedAt: null,
};
