import { useState, useEffect } from 'react';
import type { UserProfile } from '@/types';
import {
  onAuthChange,
  getUserProfile,
  ensureUserProfile,
  syncProfileToFirestore,
  mergeProfilePreferActiveSubscription,
} from '@/services/auth/firebase-auth';
import { getLocalProfile, saveLocalProfile } from '@/services/storage/indexed-db';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLocalProfile().then((profile) => {
      if (profile) setUser(profile as unknown as UserProfile);
      setLoading(false);
    });

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const local = await getLocalProfile();
        try {
          const remote = await getUserProfile(firebaseUser.uid);
          if (remote) {
            // Keep local onboarding flag + a still-valid Pro plan if Firestore
            // hasn't synced the latest activation yet.
            const remoteWithSub = mergeProfilePreferActiveSubscription(
              local as Partial<UserProfile>,
              remote,
            );
            const merged = {
              ...remoteWithSub,
              onboardingComplete: remoteWithSub.onboardingComplete || !!(local as { onboardingComplete?: boolean })?.onboardingComplete,
            };
            setUser(merged);
            await saveLocalProfile(merged as unknown as Record<string, unknown>);
            void syncProfileToFirestore(firebaseUser.uid).catch(() => {});
          } else {
            try {
              const created = await ensureUserProfile(firebaseUser.uid);
              const createdWithSub = mergeProfilePreferActiveSubscription(
                local as Partial<UserProfile>,
                created,
              );
              const merged = {
                ...createdWithSub,
                onboardingComplete: createdWithSub.onboardingComplete || !!(local as { onboardingComplete?: boolean })?.onboardingComplete,
              };
              setUser(merged);
              await saveLocalProfile(merged as unknown as Record<string, unknown>);
              void syncProfileToFirestore(firebaseUser.uid).catch(() => {});
            } catch {
              if (local) setUser(local as unknown as UserProfile);
            }
          }
        } catch {
          if (local) setUser(local as unknown as UserProfile);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refresh = async () => {
    try {
      // SYNC_ACCOUNT reconciles Firestore + the Sheets backend (paid Pro + trial
      // reuse) and returns the authoritative profile.
      const response = await chrome.runtime.sendMessage({ type: 'SYNC_ACCOUNT' });
      if (response?.profile) setUser(response.profile as UserProfile);
      return response as { profile?: UserProfile; subscriptionStatus?: string; pro?: boolean } | undefined;
    } catch {
      return undefined;
    }
  };

  return { user, loading, refresh, setUser };
}
