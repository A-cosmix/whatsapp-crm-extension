import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  gradient?: boolean;
}

export function GlassCard({ children, className, hover = false, onClick, gradient = false }: GlassCardProps) {
  const Component = onClick ? motion.button : motion.div;

  if (gradient) {
    return (
      <Component
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={hover ? { y: -4 } : undefined}
        onClick={onClick}
        className={cn('gradient-border-card', onClick && 'cursor-pointer', className)}
      >
        <div className="inner p-6 relative z-10">{children}</div>
      </Component>
    );
  }

  return (
    <Component
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={cn(hover ? 'glass-card-hover cursor-pointer' : 'glass-card', 'p-6 relative z-10', className)}
    >
      {children}
    </Component>
  );
}

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
  badge?: string;
  premium?: boolean;
  accent?: 'violet' | 'pink' | 'cyan' | 'lime';
}

const accentMap = {
  violet: 'from-violet-500/30 to-purple-500/20 text-hiremate-secondary',
  pink: 'from-fuchsia-500/30 to-pink-500/20 text-hiremate-accent',
  cyan: 'from-cyan-500/30 to-blue-500/20 text-hiremate-cyan',
  lime: 'from-lime-500/30 to-green-500/20 text-hiremate-lime',
};

export function FeatureCard({ icon: Icon, title, description, onClick, badge, premium, accent = 'violet' }: FeatureCardProps) {
  return (
    <GlassCard hover onClick={onClick} className="bento-card group">
      {premium && (
        <div className="absolute top-3 right-3 badge-primary text-[9px] z-20">PRO</div>
      )}
      <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 transition-all duration-300 group-hover:shadow-glow group-hover:scale-110', accentMap[accent])}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-base font-semibold text-hiremate-text mb-1.5">{title}</h3>
      <p className="text-sm text-hiremate-muted leading-relaxed">{description}</p>
      {badge && <span className="mt-3 inline-block badge-cyan">{badge}</span>}
    </GlassCard>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: string;
  color?: string;
}

export function StatCard({ label, value, icon: Icon, trend, color = 'gradient-text-static' }: StatCardProps) {
  return (
    <GlassCard className="!p-5">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-hiremate-muted mb-1.5">{label}</p>
          <p className={cn('text-2xl font-bold display-font', color)}>{value}</p>
          {trend && <p className="text-[11px] text-hiremate-success mt-1.5">{trend}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
            <Icon className="w-4 h-4 text-hiremate-secondary" />
          </div>
        )}
      </div>
    </GlassCard>
  );
}
