import { useState, useEffect } from 'react';
import type { DailyLearningReport } from '@/types';

interface DailyReportProps {
  onBack: () => void;
}

export function DailyReport({ onBack }: DailyReportProps) {
  const [report, setReport] = useState<DailyLearningReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chrome.runtime.sendMessage({
      type: 'GET_DAILY_REPORT',
      payload: { date: new Date().toISOString().split('T')[0] },
    }).then((response) => {
      setReport(response.report);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-4 space-y-4 max-h-[480px] overflow-y-auto">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-lg">←</button>
        <h2 className="text-lg font-bold">Daily Report 📊</h2>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : !report || report.explanationsCount === 0 ? (
        <div className="text-center py-12 space-y-3">
          <div className="text-4xl">📭</div>
          <p className="text-sm text-gray-500">No learning activity today yet. Start explaining!</p>
        </div>
      ) : (
        <>
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-center">
            <div className="text-3xl font-bold">{report.explanationsCount}</div>
            <div className="text-sm opacity-90">things learned today</div>
          </div>

          {report.topicsLearned.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Topics</h3>
              <div className="space-y-1">
                {report.topicsLearned.map((topic, i) => (
                  <div key={i} className="text-sm p-2 rounded-lg bg-white border border-gray-100">📖 {topic}</div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(report.modesUsed).length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Modes Used</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(report.modesUsed).map(([mode, count]) => (
                  <span key={mode} className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium">
                    {mode}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Websites</h3>
            <div className="text-xs text-gray-500 space-y-1">
              {report.websitesVisited.slice(0, 5).map((url, i) => (
                <div key={i} className="truncate">🌐 {new URL(url).hostname}</div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
