import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, hover = false, onClick }: GlassCardProps) {
  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={cn(hover ? 'glass-card-hover cursor-pointer' : 'glass-card', 'p-6', className)}
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
}

export function FeatureCard({ icon: Icon, title, description, onClick, badge, premium }: FeatureCardProps) {
  return (
    <GlassCard hover onClick={onClick} className="relative overflow-hidden group">
      {premium && (
        <div className="absolute top-3 right-3 badge-primary text-[10px]">PRO</div>
      )}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-hiremate-primary/20 to-hiremate-secondary/20 flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
        <Icon className="w-6 h-6 text-hiremate-secondary" />
      </div>
      <h3 className="text-lg font-semibold text-hiremate-text mb-2">{title}</h3>
      <p className="text-sm text-hiremate-muted leading-relaxed">{description}</p>
      {badge && <span className="mt-3 inline-block badge-primary">{badge}</span>}
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

export function StatCard({ label, value, icon: Icon, trend, color = 'text-hiremate-secondary' }: StatCardProps) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-hiremate-muted mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {trend && <p className="text-xs text-hiremate-success mt-1">{trend}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        )}
      </div>
    </GlassCard>
  );
}
