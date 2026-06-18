import { ACHIEVEMENTS } from '@/types';
import { getLocalProfile, saveLocalProfile } from '@/services/storage/indexed-db';

export async function checkAndUnlockAchievements(stats: {
  totalExplanations: number;
  streak: number;
  modesUsedCount: number;
}): Promise<string[]> {
  const profile = await getLocalProfile();
  if (!profile) return [];

  const current = new Set((profile.achievements as string[]) || []);
  const unlocked: string[] = [];

  const rules: Record<string, boolean> = {
    'first-explain': stats.totalExplanations >= 1,
    'streak-3': stats.streak >= 3,
    'streak-7': stats.streak >= 7,
    'streak-30': stats.streak >= 30,
    'explain-10': stats.totalExplanations >= 10,
    'explain-50': stats.totalExplanations >= 50,
    'explain-100': stats.totalExplanations >= 100,
    'all-modes': stats.modesUsedCount >= 12,
  };

  for (const achievement of ACHIEVEMENTS) {
    if (rules[achievement.id] && !current.has(achievement.id)) {
      current.add(achievement.id);
      unlocked.push(achievement.id);
    }
  }

  if (unlocked.length > 0) {
    await saveLocalProfile({ ...profile, achievements: Array.from(current) });
    const uid = profile.uid as string | undefined;
    if (uid) {
      const { updateUserProfile } = await import('@/services/auth/firebase-auth');
      void updateUserProfile(uid, { achievements: Array.from(current) }).catch(() => {});
    }
  }

  return unlocked;
}

export async function getModesUsedCount(): Promise<number> {
  const result = await chrome.storage.local.get('metrics');
  const modes = (result.metrics as { popularModes?: Record<string, number> })?.popularModes ?? {};
  return Object.keys(modes).length;
}
