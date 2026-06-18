import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileSearch, Target, FileText, Mic, Kanban, Map, Sparkles, ArrowRight, TrendingUp, Award, Zap,
} from 'lucide-react';
import { Header, GlassCard, StatCard, FeatureCard } from '../components';
import { useSubscriptionStore } from '../stores';
import { useEffect } from 'react';

const quickActions = [
  { icon: FileSearch, title: 'Analyze Resume', desc: 'Get ATS score & recommendations', to: '/resume-analyzer' },
  { icon: Target, title: 'Match Job', desc: 'See how you fit a role', to: '/job-matcher', premium: true },
  { icon: FileText, title: 'Cover Letter', desc: 'Generate in seconds', to: '/cover-letter' },
  { icon: Mic, title: 'Interview Prep', desc: 'Practice with AI', to: '/interview-prep', premium: true },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { subscription, usage, load } = useSubscriptionStore();

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <Header title="Dashboard" subtitle="Your career command center" />

      <div className="p-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 bg-gradient-to-br from-hiremate-primary/10 via-transparent to-hiremate-secondary/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-hiremate-primary/20 to-transparent rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold mb-2">
              Welcome to <span className="gradient-text">HireMate AI</span>
            </h2>
            <p className="text-hiremate-muted mb-6 max-w-lg">
              Land Jobs Faster. Apply Smarter. Your AI-powered career copilot is ready to help you land your dream role.
            </p>
            <button onClick={() => navigate('/resume-analyzer')} className="btn-primary">
              <Sparkles className="w-4 h-4" />
              Start with Resume Analysis
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Resume Scans" value={usage ? `${usage.resumeScansUsed}/${usage.resumeScans}` : '—'} icon={FileSearch} color="text-hiremate-secondary" />
          <StatCard label="Cover Letters" value={usage ? `${usage.coverLettersUsed}/${usage.coverLetters}` : '—'} icon={FileText} color="text-hiremate-primary" />
          <StatCard label="Plan" value={subscription?.plan ?? 'Free'} icon={Award} color="text-hiremate-success" trend={subscription?.plan === 'free' ? 'Upgrade for unlimited' : 'Active'} />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-hiremate-warning" />
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
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-hiremate-success" />
              <h3 className="font-semibold">Career Tips</h3>
            </div>
            <ul className="space-y-3 text-sm text-hiremate-muted">
              <li className="flex items-start gap-2"><span className="text-hiremate-primary">→</span> Tailor your resume for each job application</li>
              <li className="flex items-start gap-2"><span className="text-hiremate-primary">→</span> Use ATS-friendly formatting with standard headings</li>
              <li className="flex items-start gap-2"><span className="text-hiremate-primary">→</span> Quantify achievements with metrics and numbers</li>
              <li className="flex items-start gap-2"><span className="text-hiremate-primary">→</span> Research the company before interviews</li>
            </ul>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-3 mb-4">
              <Kanban className="w-5 h-5 text-hiremate-secondary" />
              <h3 className="font-semibold">Job Search Pipeline</h3>
            </div>
            <p className="text-sm text-hiremate-muted mb-4">Track your applications from wishlist to offer with our Kanban board.</p>
            <button onClick={() => navigate('/job-tracker')} className="btn-secondary text-sm">
              Open Job Tracker
              <ArrowRight className="w-4 h-4" />
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
