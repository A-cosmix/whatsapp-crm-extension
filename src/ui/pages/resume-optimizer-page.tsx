import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Copy, Check } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Header, GlassCard, Button, Textarea, Input, LoadingSequence } from '../components';
import { sendMessage, copyToClipboard } from '../lib/utils';
import type { OptimizedResume } from '@domain/entities';

export function ResumeOptimizerPage() {
  const [jobId, setJobId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [optimized, setOptimized] = useState<OptimizedResume | null>(null);
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const match = await sendMessage<{ id: string }>('MATCH_JOB', {
        jobTitle: 'Target Role',
        company: 'Target Company',
        jobDescription,
      });
      return sendMessage<OptimizedResume>('OPTIMIZE_RESUME', { jobId: match.id || jobId });
    },
    onSuccess: setOptimized,
  });

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <Header title="Resume Optimizer" subtitle="Tailor your resume for any job in one click" />
      <LoadingSequence isLoading={mutation.isPending} />

      <div className="p-8 space-y-8">
        <GlassCard className="space-y-4">
          <Textarea
            label="Job Description"
            placeholder="Paste the job description to optimize your resume for..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
          />
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending} disabled={!jobDescription}>
            <Sparkles className="w-4 h-4" />
            Optimize Resume
          </Button>
        </GlassCard>

        {optimized && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {[
              { title: 'Optimized Summary', content: optimized.summary },
              { title: 'Skills', content: optimized.skills.join(', ') },
              { title: 'Experience', content: optimized.experience },
              { title: 'Projects', content: optimized.projects },
            ].map((section) => (
              <GlassCard key={section.title}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{section.title}</h3>
                  <button onClick={() => handleCopy(section.content)} className="btn-ghost text-xs">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <p className="text-sm text-hiremate-muted whitespace-pre-wrap">{section.content}</p>
              </GlassCard>
            ))}

            <GlassCard>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">ATS-Friendly Version</h3>
                <Button size="sm" onClick={() => handleCopy(optimized.atsFriendlyVersion)}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  Copy All
                </Button>
              </div>
              <pre className="text-xs text-hiremate-muted whitespace-pre-wrap max-h-64 overflow-y-auto">
                {optimized.atsFriendlyVersion}
              </pre>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
