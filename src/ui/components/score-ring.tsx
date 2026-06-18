import { motion } from 'framer-motion';
import { getScoreColor } from '../lib/utils';

interface ScoreRingProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { outer: 'w-20 h-20', inner: 'text-xl', label: 'text-xs' },
  md: { outer: 'w-32 h-32', inner: 'text-3xl', label: 'text-sm' },
  lg: { outer: 'w-40 h-40', inner: 'text-4xl', label: 'text-base' },
};

export function ScoreRing({ score, label, size = 'md' }: ScoreRingProps) {
  const color = getScoreColor(score);
  const s = sizes[size];

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className={`score-ring ${s.outer}`}
        style={{ '--score-color': color, '--score-percent': score } as React.CSSProperties}
      >
        <span className={`relative z-10 font-bold ${s.inner}`} style={{ color }}>
          {score}
        </span>
      </motion.div>
      {label && <span className={`text-hiremate-muted font-medium ${s.label}`}>{label}</span>}
    </div>
  );
}

interface GradeBadgeProps {
  grade: string;
}

export function GradeBadge({ grade }: GradeBadgeProps) {
  const color = grade.startsWith('A') ? 'text-hiremate-success' : grade === 'B' ? 'text-hiremate-secondary' : grade === 'C' ? 'text-hiremate-warning' : 'text-hiremate-danger';

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`text-5xl font-black ${color}`}
    >
      {grade}
    </motion.span>
  );
}
