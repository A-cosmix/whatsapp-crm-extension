import { BarChart3, Globe, Clock } from 'lucide-react';
import type { PageAnalytics } from '../types';

interface AnalyticsWidgetProps {
  analytics: PageAnalytics[];
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function AnalyticsWidget({ analytics }: AnalyticsWidgetProps) {
  const sorted = [...analytics].sort((a, b) => b.totalTime - a.totalTime).slice(0, 8);
  const totalTime = analytics.reduce((sum, a) => sum + a.totalTime, 0);
  const maxTime = sorted[0]?.totalTime ?? 1;

  return (
    <div className="mx-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} style={{ color: 'var(--mx-accent)' }} />
          <p className="text-sm font-medium">Productivity Analytics</p>
        </div>
        <div className="flex items-center gap-1 text-xs opacity-50">
          <Clock size={12} />
          {formatDuration(totalTime)} today
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="flex-1 flex items-center justify-center opacity-40 text-sm text-center">
          <div>
            <Globe size={24} className="mx-auto mb-2" />
            Browse the web to see analytics
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-2.5">
          {sorted.map((site) => (
            <div key={site.domain}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="truncate flex-1 mr-2">{site.domain}</span>
                <span className="opacity-50 shrink-0">{formatDuration(site.totalTime)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--mx-border)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(site.totalTime / maxTime) * 100}%`,
                    background: 'linear-gradient(90deg, var(--mx-accent), color-mix(in srgb, var(--mx-accent) 50%, transparent))',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
