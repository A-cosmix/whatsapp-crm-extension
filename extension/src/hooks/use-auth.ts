import { useState, useEffect } from 'react';
import type { UserProfile } from '@/types';
import { onAuthChange, getUserProfile } from '@/services/auth/firebase-auth';
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
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            setUser(profile);
            await saveLocalProfile(profile as unknown as Record<string, unknown>);
          }
        } catch {
          // Firestore may be unavailable — use cached local profile
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
