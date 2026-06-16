import { ACHIEVEMENTS } from '@/types';

interface StreakBadgeProps {
  streak: number;
  achievements: string[];
}

export function StreakBadge({ streak, achievements }: StreakBadgeProps) {
  const unlocked = ACHIEVEMENTS.filter((a) => achievements.includes(a.id));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
        <span className="text-3xl">🔥</span>
        <div>
          <div className="text-2xl font-bold text-orange-600">{streak} day{streak !== 1 ? 's' : ''}</div>
          <div className="text-xs text-orange-500">Learning streak</div>
        </div>
      </div>

      {unlocked.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Achievements</h4>
          <div className="flex flex-wrap gap-2">
            {unlocked.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100"
                title={a.description}
              >
                <span>{a.emoji}</span>
                <span className="text-xs font-medium text-brand-700">{a.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
