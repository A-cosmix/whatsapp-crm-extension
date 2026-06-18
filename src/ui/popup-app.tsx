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

  const openDashboard = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="w-[360px] text-hiremate-text overflow-hidden" style={{ background: 'linear-gradient(180deg, #0c0c12 0%, #050508 100%)' }}>
      {/* Header */}
      <div className="p-4 relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/10 to-transparent" />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-hiremate-primary via-hiremate-secondary to-hiremate-accent flex items-center justify-center shadow-neon">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold gradient-text-static display-font text-sm">HireMate AI</h1>
            <p className="text-[9px] text-hiremate-muted tracking-widest uppercase">Career Copilot ✨</p>
          </div>
        </div>
      </div>

      {jobDetected && (
        <div className="mx-3 mt-3 p-3 rounded-xl text-xs border border-emerald-500/30"
          style={{ background: 'rgba(74,222,128,0.08)' }}
        >
          <Target className="w-3.5 h-3.5 text-hiremate-success inline mr-1" />
          Job detected! Tap below to analyze match 🎯
        </div>
      )}

      <div className="p-3 space-y-1.5">
        {[
          { icon: FileSearch, label: 'Analyze Resume', sub: usage ? `${usage.resumeScans - usage.resumeScansUsed} scans left` : 'Get ATS score', color: 'text-hiremate-secondary', action: openDashboard },
          { icon: Target, label: 'Match This Job', sub: 'See your fit score', color: 'text-hiremate-cyan', action: openDashboard },
          { icon: Crown, label: 'Upgrade to Pro', sub: subscription?.plan === 'free' ? 'Unlock everything 🔓' : `Plan: ${subscription?.plan}`, color: 'text-hiremate-accent', action: openDashboard },
        ].map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 border border-transparent hover:border-white/[0.08] hover:bg-white/[0.04] group"
          >
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center group-hover:shadow-glow transition-shadow">
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-[10px] text-hiremate-muted">{item.sub}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
        <span className="text-[11px] text-hiremate-muted">{user?.name ?? 'Guest User'}</span>
        <button onClick={openDashboard} className="p-2 rounded-xl hover:bg-white/[0.05] border border-white/[0.06]">
          <Settings className="w-3.5 h-3.5 text-hiremate-muted" />
        </button>
      </div>

      <button
        onClick={openDashboard}
        className="w-full py-3 text-center text-xs font-semibold gradient-text-static border-t border-white/[0.06] hover:bg-white/[0.03] transition-colors"
      >
        <ExternalLink className="w-3 h-3 inline mr-1" />
        Open Full Dashboard →
      </button>
    </div>
  );
}
