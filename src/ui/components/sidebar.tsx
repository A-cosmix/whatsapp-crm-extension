import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileSearch, Target, FileText, MessageSquare, Mic,
  Linkedin, Kanban, DollarSign, Map, Settings, Crown, Sparkles,
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/resume-analyzer', icon: FileSearch, label: 'Resume Analyzer' },
  { to: '/job-matcher', icon: Target, label: 'Job Matcher', premium: true },
  { to: '/resume-optimizer', icon: Sparkles, label: 'Resume Optimizer', premium: true },
  { to: '/cover-letter', icon: FileText, label: 'Cover Letter' },
  { to: '/application-assistant', icon: MessageSquare, label: 'Application Assistant' },
  { to: '/interview-prep', icon: Mic, label: 'Interview Prep', premium: true },
  { to: '/linkedin-auditor', icon: Linkedin, label: 'LinkedIn Auditor', premium: true },
  { to: '/job-tracker', icon: Kanban, label: 'Job Tracker' },
  { to: '/salary-insights', icon: DollarSign, label: 'Salary Insights', premium: true },
  { to: '/career-roadmap', icon: Map, label: 'Career Roadmap', premium: true },
  { to: '/pricing', icon: Crown, label: 'Upgrade' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside className="w-64 min-h-screen flex flex-col relative z-20 border-r border-white/[0.06]"
      style={{ background: 'linear-gradient(180deg, rgba(12,12,18,0.95) 0%, rgba(8,8,12,0.98) 100%)', backdropFilter: 'blur(20px)' }}
    >
      {/* Logo */}
      <div className="p-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-hiremate-primary via-hiremate-secondary to-hiremate-accent flex items-center justify-center shadow-neon">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base gradient-text-static display-font">HireMate AI</h1>
            <p className="text-[9px] text-hiremate-muted tracking-[0.2em] uppercase">Land Jobs Faster</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(isActive ? 'nav-link-active' : 'nav-link', 'relative')}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
            {item.premium && (
              <span className="absolute right-2 text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded-md"
                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(244,114,182,0.2))', color: '#E9D5FF' }}
              >
                PRO
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Upgrade CTA */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="gradient-border-card">
          <div className="inner p-4">
            <p className="text-[11px] text-hiremate-muted mb-2 leading-relaxed">
              Offer letter loading... <span className="text-hiremate-accent">✨</span>
            </p>
            <NavLink to="/pricing" className="text-xs font-bold gradient-text-static hover:opacity-80 transition-opacity">
              Upgrade to Pro →
            </NavLink>
          </div>
        </div>
      </div>
    </aside>
  );
}
