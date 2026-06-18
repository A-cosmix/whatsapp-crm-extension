import { create } from 'zustand';
import type { User, Subscription, UsageLimits, AppSettings } from '@domain/entities';
import { sendMessage } from '../lib/utils';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  loadUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  loadUser: async () => {
    set({ isLoading: true });
    try {
      const user = await sendMessage<User | null>('GET_USER');
      set({ user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
  signOut: async () => {
    await sendMessage('SIGN_OUT');
    set({ user: null });
  },
}));

interface SubscriptionState {
  subscription: Subscription | null;
  usage: UsageLimits | null;
  load: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscription: null,
  usage: null,
  load: async () => {
    const [subscription, usage] = await Promise.all([
      sendMessage<Subscription>('GET_SUBSCRIPTION'),
      sendMessage<UsageLimits>('GET_USAGE'),
    ]);
    set({ subscription, usage });
  },
}));

interface SettingsState {
  settings: AppSettings | null;
  load: () => Promise<void>;
  save: (settings: Partial<AppSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  load: async () => {
    const settings = await sendMessage<AppSettings>('GET_SETTINGS');
    set({ settings });
  },
  save: async (partial) => {
    await sendMessage('SAVE_SETTINGS', partial);
    const settings = await sendMessage<AppSettings>('GET_SETTINGS');
    set({ settings });
  },
}));

interface OnboardingState {
  completed: boolean;
  step: number;
  setStep: (step: number) => void;
  complete: () => void;
  load: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  completed: false,
  step: 0,
  setStep: (step) => set({ step }),
  complete: () => {
    chrome.storage.local.set({ hiremate_onboarding: 'done' });
    set({ completed: true });
  },
  load: async () => {
    const result = await chrome.storage.local.get('hiremate_onboarding');
    set({ completed: result.hiremate_onboarding === 'done' });
  },
}));
