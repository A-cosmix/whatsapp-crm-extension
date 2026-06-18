import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSearch,
  Target,
  FileText,
  MessageSquare,
  Mic,
  Linkedin,
  Kanban,
  DollarSign,
  Map,
  Settings,
  Crown,
  Sparkles,
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
    <aside className="w-64 min-h-screen border-r border-white/5 bg-hiremate-card/50 backdrop-blur-xl flex flex-col">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-hiremate-primary to-hiremate-secondary flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg gradient-text">HireMate AI</h1>
            <p className="text-[10px] text-hiremate-muted">Land Jobs Faster</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(isActive ? 'nav-link-active' : 'nav-link', 'relative')
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
            {item.premium && (
              <span className="absolute right-3 text-[9px] font-bold text-hiremate-secondary bg-hiremate-primary/20 px-1.5 py-0.5 rounded">
                PRO
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="glass-card p-4 bg-gradient-to-br from-hiremate-primary/10 to-transparent">
          <p className="text-xs text-hiremate-muted mb-2">Dream company offer letter incoming.</p>
          <NavLink to="/pricing" className="text-xs font-semibold text-hiremate-secondary hover:text-hiremate-primary transition-colors">
            Upgrade to Pro →
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
