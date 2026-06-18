import { useState } from 'react';
import { Sparkles, FileSearch, Target, Crown, Settings, ExternalLink } from 'lucide-react';
import { useAuthStore, useSubscriptionStore } from './stores';
import { useEffect } from 'react';
import './styles/globals.css';

export function PopupApp() {
  const { user, loadUser } = useAuthStore();
  const { subscription, usage, load } = useSubscriptionStore();
  const [jobDetected, setJobDetected] = useState(false);

  useEffect(() => {
    loadUser();
    load();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url ?? '';
      if (/linkedin\.com\/jobs|indeed\.com|naukri\.com|glassdoor\./.test(url)) {
        setJobDetected(true);
      }
    });
  }, [loadUser, load]);

  const openDashboard = (path = '/dashboard') => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="w-[360px] bg-hiremate-bg text-hiremate-text">
      <div className="p-4 bg-gradient-to-br from-hiremate-primary/20 to-transparent border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-hiremate-primary to-hiremate-secondary flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold gradient-text">HireMate AI</h1>
            <p className="text-[10px] text-hiremate-muted">Land Jobs Faster</p>
          </div>
        </div>
      </div>

      {jobDetected && (
        <div className="mx-4 mt-4 p-3 rounded-xl bg-hiremate-success/10 border border-hiremate-success/30 text-xs">
          <Target className="w-4 h-4 text-hiremate-success inline mr-1" />
          Job page detected! Open dashboard to analyze match.
        </div>
      )}

      <div className="p-4 space-y-2">
        <button onClick={() => openDashboard('/resume-analyzer')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left">
          <FileSearch className="w-5 h-5 text-hiremate-secondary" />
          <div>
            <p className="text-sm font-medium">Analyze Resume</p>
            <p className="text-[10px] text-hiremate-muted">
              {usage ? `${usage.resumeScans - usage.resumeScansUsed} scans left` : 'Get ATS score'}
            </p>
          </div>
        </button>

        <button onClick={() => openDashboard('/job-matcher')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left">
          <Target className="w-5 h-5 text-hiremate-primary" />
          <div>
            <p className="text-sm font-medium">Match This Job</p>
            <p className="text-[10px] text-hiremate-muted">See your fit score</p>
          </div>
        </button>

        <button onClick={() => openDashboard('/pricing')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left">
          <Crown className="w-5 h-5 text-hiremate-warning" />
          <div>
            <p className="text-sm font-medium">Upgrade to Pro</p>
            <p className="text-[10px] text-hiremate-muted">
              {subscription?.plan === 'free' ? 'Unlock all features' : `Plan: ${subscription?.plan}`}
            </p>
          </div>
        </button>
      </div>

      <div className="p-4 border-t border-white/5 flex items-center justify-between">
        <div className="text-xs text-hiremate-muted">
          {user?.name ?? 'Guest User'}
        </div>
        <button onClick={() => openDashboard('/settings')} className="p-2 rounded-lg hover:bg-white/5">
          <Settings className="w-4 h-4 text-hiremate-muted" />
        </button>
      </div>

      <button
        onClick={() => openDashboard()}
        className="w-full p-3 text-center text-xs text-hiremate-secondary hover:text-hiremate-primary transition-colors border-t border-white/5"
      >
        <ExternalLink className="w-3 h-3 inline mr-1" />
        Open Full Dashboard
      </button>
    </div>
  );
}
