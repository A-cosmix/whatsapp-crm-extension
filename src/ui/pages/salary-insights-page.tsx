import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Header, GlassCard, Button, Input, LoadingSequence } from '../components';
import { sendMessage } from '../lib/utils';
import { formatCurrency } from '@domain/value-objects';
import type { SalaryInsight } from '@domain/entities';

export function SalaryInsightsPage() {
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState(2);
  const [skills, setSkills] = useState('');
  const [insight, setInsight] = useState<SalaryInsight | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      sendMessage<SalaryInsight>('ESTIMATE_SALARY', {
        role,
        location,
        experienceYears: experience,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      }),
    onSuccess: setInsight,
  });

  return (
    <div>
      <Header title="Salary Insights" subtitle="Market-rate salary estimates for your role" />
      <LoadingSequence isLoading={mutation.isPending} />

      <div className="p-8 space-y-8">
        <GlassCard className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Role" placeholder="e.g. Frontend Developer" value={role} onChange={(e) => setRole(e.target.value)} />
            <Input label="Location" placeholder="e.g. Bangalore" value={location} onChange={(e) => setLocation(e.target.value)} />
            <Input label="Years of Experience" type="number" value={experience} onChange={(e) => setExperience(Number(e.target.value))} />
            <Input label="Skills (comma-separated)" placeholder="React, TypeScript, Node.js" value={skills} onChange={(e) => setSkills(e.target.value)} />
          </div>
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending} disabled={!role || !location}>
            <DollarSign className="w-4 h-4" />
            Estimate Salary
          </Button>
        </GlassCard>

        {insight && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <GlassCard className="text-center p-8 bg-gradient-to-br from-hiremate-primary/10 to-transparent">
              <p className="text-sm text-hiremate-muted mb-2">Estimated Salary</p>
              <p className="text-4xl font-bold gradient-text mb-2">
                {formatCurrency(insight.estimatedSalary, insight.currency)}
              </p>
              <p className="text-sm text-hiremate-muted">
                Market Range: {formatCurrency(insight.marketRange.min, insight.currency)} — {formatCurrency(insight.marketRange.max, insight.currency)}
              </p>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassCard>
                <p className="text-xs text-hiremate-muted">Role</p>
                <p className="font-semibold">{insight.role}</p>
              </GlassCard>
              <GlassCard>
                <p className="text-xs text-hiremate-muted">Location</p>
                <p className="font-semibold">{insight.location}</p>
              </GlassCard>
              <GlassCard>
                <p className="text-xs text-hiremate-muted">Experience</p>
                <p className="font-semibold">{insight.experienceYears} years</p>
              </GlassCard>
            </div>

            <GlassCard>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-hiremate-success" />
                Skills Considered
              </h3>
              <div className="flex flex-wrap gap-2">
                {insight.skills.map((s) => (
                  <span key={s} className="badge-primary">{s}</span>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}