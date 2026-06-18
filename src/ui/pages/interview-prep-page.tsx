import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, ChevronDown, ChevronUp } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Header, GlassCard, Button, Textarea, Select, LoadingSequence } from '../components';
import { sendMessage } from '../lib/utils';
import type { InterviewPrep, InterviewDifficulty } from '@domain/entities';

export function InterviewPrepPage() {
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>('medium');
  const [jobDescription, setJobDescription] = useState('');
  const [prep, setPrep] = useState<InterviewPrep | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const match = await sendMessage<{ id: string }>('MATCH_JOB', {
        jobTitle: 'Interview',
        company: 'Company',
        jobDescription,
      });
      return sendMessage<InterviewPrep>('GENERATE_INTERVIEW_PREP', { jobId: match.id, jobDescription, difficulty });
    },
    onSuccess: setPrep,
  });

  const categoryColors: Record<string, string> = {
    technical: 'badge-primary',
    hr: 'badge-success',
    behavioral: 'badge-warning',
    general: 'badge-primary',
  };

  return (
    <div>
      <Header title="Interview Prep AI" subtitle="Practice with likely questions and model answers" />
      <LoadingSequence isLoading={mutation.isPending} />

      <div className="p-8 space-y-8">
        <GlassCard className="space-y-4">
          <Select
            label="Difficulty Level"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as InterviewDifficulty)}
            options={[
              { value: 'easy', label: 'Easy' },
              { value: 'medium', label: 'Medium' },
              { value: 'hard', label: 'Hard' },
            ]}
          />
          <Textarea
            label="Job Description"
            placeholder="Paste the job description for targeted interview prep..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
          />
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending} disabled={!jobDescription}>
            <Mic className="w-4 h-4" />
            Generate Questions
          </Button>
        </GlassCard>

        {prep && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {prep.questions.map((q, i) => (
              <GlassCard key={i} className="!p-4">
                <button
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  className="w-full flex items-start justify-between gap-4 text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={categoryColors[q.category] ?? 'badge-primary'}>{q.category}</span>
                      <span className="badge-warning">{q.difficulty}</span>
                    </div>
                    <p className="font-medium text-sm">{q.question}</p>
                  </div>
                  {expanded === i ? <ChevronUp className="w-5 h-5 text-hiremate-muted shrink-0" /> : <ChevronDown className="w-5 h-5 text-hiremate-muted shrink-0" />}
                </button>
                {expanded === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-white/5"
                  >
                    <p className="text-xs text-hiremate-muted mb-1">Model Answer</p>
                    <p className="text-sm text-hiremate-text leading-relaxed">{q.modelAnswer}</p>
                  </motion.div>
                )}
              </GlassCard>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
