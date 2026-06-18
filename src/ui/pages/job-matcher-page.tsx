import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, AlertTriangle, TrendingUp, Percent } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Header, GlassCard, ScoreRing, Button, Textarea, Input, LoadingSequence } from '../components';
import { sendMessage } from '../lib/utils';
import type { JobMatch } from '@domain/entities';

export function JobMatcherPage() {
  const [match, setMatch] = useState<JobMatch | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      sendMessage<JobMatch>('MATCH_JOB', { jobTitle, company, jobDescription }),
    onSuccess: setMatch,
  });

  return (
    <div>
      <Header title="Job Matcher" subtitle="See how well you match any job description" />
      <LoadingSequence isLoading={mutation.isPending} />

      <div className="p-8 space-y-8">
        <GlassCard className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Job Title" placeholder="e.g. Frontend Developer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            <Input label="Company" placeholder="e.g. Google" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <Textarea
            label="Job Description"
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={8}
          />
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending} disabled={!jobDescription || !jobTitle}>
            <Target className="w-4 h-4" />
            Analyze Match
          </Button>
          {mutation.isError && (
            <p className="text-sm text-hiremate-danger">{(mutation.error as Error).message}</p>
          )}
        </GlassCard>

        {match && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <GlassCard className="flex flex-col items-center">
                <ScoreRing score={match.matchScore} label="Job Match" size="sm" />
              </GlassCard>
              <GlassCard className="flex flex-col items-center">
                <ScoreRing score={match.interviewChance} label="Interview Chance" size="sm" />
              </GlassCard>
              <GlassCard className="flex flex-col items-center">
                <ScoreRing score={match.applicationStrength} label="Application Strength" size="sm" />
              </GlassCard>
              <GlassCard className="flex items-center justify-center">
                <div className="text-center">
                  <Percent className="w-8 h-8 text-hiremate-secondary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-hiremate-text">{match.matchScore}%</p>
                  <p className="text-xs text-hiremate-muted">Overall Fit</p>
                </div>
              </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-hiremate-warning" />
                  Missing Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {match.missingSkills.map((s) => (
                    <span key={s} className="badge-warning">{s}</span>
                  ))}
                </div>
              </GlassCard>
              <GlassCard>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-hiremate-danger" />
                  Keyword Gaps
                </h3>
                <div className="flex flex-wrap gap-2">
                  {match.keywordGaps.map((k) => (
                    <span key={k} className="badge-danger">{k}</span>
                  ))}
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
