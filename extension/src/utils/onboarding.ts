/**
 * Onboarding state persistence and step definitions.
 */

import type { OnboardingState, OnboardingStep } from '@/types';
import { DEFAULT_ONBOARDING } from '@/types';

const STORAGE_KEY = 'onboardingState';

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to AI Email Summarizer',
    subtitle: 'Your intelligent inbox assistant for Gmail and Outlook. Let us show you around in under a minute.',
    icon: '✨',
  },
  {
    id: 'api-key',
    title: 'Connect Your Claude API Key',
    subtitle: 'We use Anthropic Claude to analyze emails. Your key stays in your browser and is never shared.',
    icon: '🔑',
  },
  {
    id: 'features',
    title: 'What You Get',
    subtitle: 'Powerful AI features to tame your inbox.',
    icon: '🚀',
  },
  {
    id: 'how-to-use',
    title: 'How to Use It',
    subtitle: 'Open any email in Gmail or Outlook — the AI panel appears automatically.',
    icon: '📧',
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts',
    subtitle: 'Speed up your workflow with customizable hotkeys.',
    icon: '⌨️',
  },
  {
    id: 'ready',
    title: "You're All Set!",
    subtitle: 'Head to Gmail or Outlook and open an email to see the magic.',
    icon: '🎉',
  },
];

export const FEATURE_HIGHLIGHTS = [
  { icon: '📝', title: 'Smart Summaries', desc: '2–3 bullet points per email' },
  { icon: '🔴', title: 'Priority Tags', desc: 'Important, Routine, Low Priority' },
  { icon: '😊', title: 'Sentiment Analysis', desc: 'Tone detection with emoji indicators' },
  { icon: '📅', title: 'Meeting Extractor', desc: 'Dates, attendees, calendar links' },
  { icon: '💬', title: 'Smart Replies', desc: 'Formal, casual, and urgent drafts' },
  { icon: '⏰', title: 'Snooze & Digest', desc: 'Reminders and weekly reports' },
] as const;

export async function getOnboardingState(): Promise<OnboardingState> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return { ...DEFAULT_ONBOARDING, ...(result[STORAGE_KEY] as Partial<OnboardingState> | undefined) };
}

export async function saveOnboardingState(state: OnboardingState): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: state });
}

export async function completePopupOnboarding(skipped = false): Promise<OnboardingState> {
  const state: OnboardingState = {
    popupCompleted: true,
    emailTourCompleted: false,
    completedAt: Date.now(),
    skipped,
  };
  await saveOnboardingState(state);
  return state;
}

export async function completeEmailTour(): Promise<void> {
  const current = await getOnboardingState();
  await saveOnboardingState({ ...current, emailTourCompleted: true });
}

export async function resetOnboarding(): Promise<OnboardingState> {
  await saveOnboardingState({ ...DEFAULT_ONBOARDING });
  return { ...DEFAULT_ONBOARDING };
}

export function shouldShowPopupOnboarding(state: OnboardingState): boolean {
  return !state.popupCompleted;
}

export function shouldShowEmailTour(state: OnboardingState): boolean {
  return state.popupCompleted && !state.emailTourCompleted;
}
