import type { AIAction, AppSettings, ChatMessage, DailyGoal, Note, PageAnalytics, Reminder, TimerState } from '../types';

export const MessageTypes = {
  GET_STATE: 'MX_GET_STATE',
  UPDATE_SETTINGS: 'MX_UPDATE_SETTINGS',
  AI_CHAT: 'MX_AI_CHAT',
  AI_ACTION: 'MX_AI_ACTION',
  SUMMARIZE_PAGE: 'MX_SUMMARIZE_PAGE',
  SUMMARIZE_YOUTUBE: 'MX_SUMMARIZE_YOUTUBE',
  ADD_NOTE: 'MX_ADD_NOTE',
  UPDATE_NOTE: 'MX_UPDATE_NOTE',
  DELETE_NOTE: 'MX_DELETE_NOTE',
  ADD_GOAL: 'MX_ADD_GOAL',
  TOGGLE_GOAL: 'MX_TOGGLE_GOAL',
  DELETE_GOAL: 'MX_DELETE_GOAL',
  UPDATE_TIMER: 'MX_UPDATE_TIMER',
  ADD_REMINDER: 'MX_ADD_REMINDER',
  TRACK_ANALYTICS: 'MX_TRACK_ANALYTICS',
  GET_ANALYTICS: 'MX_GET_ANALYTICS',
  OPEN_SIDEPANEL: 'MX_OPEN_SIDEPANEL',
  GET_SELECTION: 'MX_GET_SELECTION',
  STATE_CHANGED: 'MX_STATE_CHANGED',
} as const;

export type MessageType = (typeof MessageTypes)[keyof typeof MessageTypes];

export interface ExtensionState {
  settings: AppSettings;
  notes: Note[];
  goals: DailyGoal[];
  timer: TimerState;
  chatHistory: ChatMessage[];
  reminders: Reminder[];
  analytics: PageAnalytics[];
}

export interface RuntimeMessage {
  type: MessageType;
  payload?: unknown;
}

export interface RuntimeResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function sendMessage<T>(type: MessageType, payload?: unknown): Promise<T> {
  const response = (await chrome.runtime.sendMessage({ type, payload })) as RuntimeResponse<T>;
  if (!response?.success) {
    throw new Error(response?.error ?? 'Unknown error');
  }
  return response.data as T;
}
