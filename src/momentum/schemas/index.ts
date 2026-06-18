import { z } from 'zod';

export const ThemeModeSchema = z.enum(['dark', 'light', 'system']);
export const AccentThemeSchema = z.enum(['electric', 'neon', 'cyan', 'emerald', 'rose']);

export const AppSettingsSchema = z.object({
  apiKey: z.string(),
  apiBaseUrl: z.string().url(),
  model: z.string().min(1),
  theme: ThemeModeSchema,
  accent: AccentThemeSchema,
  onboardingComplete: z.boolean(),
  floatingAssistant: z.boolean(),
  voiceEnabled: z.boolean(),
  notificationsEnabled: z.boolean(),
  dailyGoalTarget: z.number().min(1).max(20),
  focusDuration: z.number().min(1).max(120),
  breakDuration: z.number().min(1).max(30),
});

export const NoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  createdAt: z.number(),
  updatedAt: z.number(),
  pinned: z.boolean(),
});

export const DailyGoalSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  completed: z.boolean(),
  createdAt: z.number(),
});

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.number(),
});

export const ReminderSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  scheduledAt: z.number(),
  completed: z.boolean(),
});

export const PageAnalyticsSchema = z.object({
  domain: z.string(),
  totalTime: z.number(),
  visits: z.number(),
  lastVisit: z.number(),
});

export const AIActionSchema = z.object({
  type: z.enum(['summarize', 'rewrite', 'explain', 'reply', 'suggest']),
  input: z.string().min(1),
  context: z.string().optional(),
});
