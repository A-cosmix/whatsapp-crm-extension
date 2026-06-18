import { useState, useEffect } from 'react';
import type { UserProfile } from '@/types';
import { onAuthChange, getUserProfile, ensureUserProfile, syncProfileToFirestore } from '@/services/auth/firebase-auth';
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
            // Keep local onboarding flag if Firestore hasn't synced yet
            const merged = {
              ...remote,
              onboardingComplete: remote.onboardingComplete || !!(local as { onboardingComplete?: boolean })?.onboardingComplete,
            };
            setUser(merged);
            await saveLocalProfile(merged as unknown as Record<string, unknown>);
            void syncProfileToFirestore(firebaseUser.uid).catch(() => {});
          } else {
            try {
              const created = await ensureUserProfile(firebaseUser.uid);
              const merged = {
                ...created,
                onboardingComplete: created.onboardingComplete || !!(local as { onboardingComplete?: boolean })?.onboardingComplete,
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
    const response = await chrome.runtime.sendMessage({ type: 'GET_USER' });
    if (response.profile) setUser(response.profile);
  };

  return { user, loading, refresh, setUser };
}
