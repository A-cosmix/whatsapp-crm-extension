import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileSearch, Target, FileText, Mic, Kanban, Sparkles, ArrowRight, TrendingUp, Award, Zap,
} from 'lucide-react';
import { Header, GlassCard, StatCard, FeatureCard } from '../components';
import { useSubscriptionStore } from '../stores';
import { useEffect } from 'react';

const quickActions = [
  { icon: FileSearch, title: 'Analyze Resume', desc: 'ATS score + glow up tips', to: '/resume-analyzer', accent: 'violet' as const },
  { icon: Target, title: 'Match Job', desc: 'See your fit score', to: '/job-matcher', premium: true, accent: 'cyan' as const },
  { icon: FileText, title: 'Cover Letter', desc: 'Generate in seconds', to: '/cover-letter', accent: 'pink' as const },
  { icon: Mic, title: 'Interview Prep', desc: 'Practice with AI', to: '/interview-prep', premium: true, accent: 'lime' as const },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { subscription, usage, load } = useSubscriptionStore();

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <Header title="Dashboard" subtitle="Your career command center ✨" />

      <div className="p-8 space-y-8">
        {/* Hero bento */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard gradient className="!p-0 overflow-hidden">
            <div className="inner p-8 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-violet-500/20 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-fuchsia-500/15 blur-3xl" />
              <div className="relative z-10">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="genz-tag">#CareerGlowUp</span>
                  <span className="badge-cyan">AI Powered</span>
                </div>
                <h2 className="display-font text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
                  Welcome to <span className="gradient-text">HireMate AI</span>
                </h2>
                <p className="text-hiremate-muted mb-6 max-w-lg text-sm leading-relaxed">
                  Land Jobs Faster. Apply Smarter. Your AI copilot is locked and loaded — let&apos;s get you that offer letter. 🔥
                </p>
                <button onClick={() => navigate('/resume-analyzer')} className="btn-primary">
                  <Sparkles className="w-4 h-4" />
                  Start Resume Analysis
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Resume Scans" value={usage ? `${usage.resumeScansUsed}/${usage.resumeScans}` : '—'} icon={FileSearch} />
          <StatCard label="Cover Letters" value={usage ? `${usage.coverLettersUsed}/${usage.coverLetters}` : '—'} icon={FileText} />
          <StatCard label="Plan" value={subscription?.plan ?? 'Free'} icon={Award} trend={subscription?.plan === 'free' ? '↑ Upgrade for unlimited' : '✓ Active'} />
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="text-base font-display font-bold mb-4 flex items-center gap-2 display-font">
            <Zap className="w-4 h-4 text-hiremate-warning" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <FeatureCard
                key={action.to}
                icon={action.icon}
                title={action.title}
                description={action.desc}
                onClick={() => navigate(action.to)}
                premium={action.premium}
                accent={action.accent}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <GlassCard>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <TrendingUp className="w-4 h-4 text-hiremate-success" />
              <h3 className="font-semibold text-sm">Pro Tips</h3>
            </div>
            <ul className="space-y-2.5 text-sm text-hiremate-muted relative z-10">
              {['Tailor resume for each application', 'Quantify achievements with numbers', 'Use ATS-friendly headings', 'Research company before interviews'].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <span className="text-hiremate-accent mt-0.5">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard gradient className="!p-0">
            <div className="inner p-6 relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Kanban className="w-4 h-4 text-hiremate-cyan" />
                <h3 className="font-semibold text-sm">Job Pipeline</h3>
              </div>
              <p className="text-sm text-hiremate-muted mb-4">Track wishlist → applied → interview → offer. Stay organized, stay winning.</p>
              <button onClick={() => navigate('/job-tracker')} className="btn-secondary text-sm w-full">
                Open Job Tracker
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
