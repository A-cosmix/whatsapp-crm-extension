import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Lightbulb, Tag } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Header, FileUpload, GlassCard, ScoreRing, GradeBadge, Button, LoadingSequence, SuccessAnimation } from '../components';
import { sendMessage } from '../lib/utils';
import type { ResumeAnalysis } from '@domain/entities';
import { useSubscriptionStore } from '../stores';

export function ResumeAnalyzerPage() {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { load: reloadUsage } = useSubscriptionStore();

  const mutation = useMutation({
    mutationFn: async ({ fileName, content }: { fileName: string; content: string }) =>
      sendMessage<ResumeAnalysis>('ANALYZE_RESUME', { fileName, content }),
    onSuccess: (data) => {
      setAnalysis(data);
      setShowSuccess(true);
      reloadUsage();
      setTimeout(() => setShowSuccess(false), 2500);
    },
  });

  return (
    <div>
      <Header title="Resume Analyzer" subtitle="AI-powered ATS scoring and optimization" />
      <LoadingSequence isLoading={mutation.isPending} />

      <div className="p-8 space-y-8">
        <GlassCard>
          <FileUpload
            onFileSelect={(file, content) => {
              mutation.mutate({ fileName: file.name, content });
            }}
          />
          {mutation.isError && (
            <div className="mt-4 p-4 rounded-xl bg-hiremate-danger/10 border border-hiremate-danger/30 text-sm text-hiremate-danger">
              {(mutation.error as Error).message}
            </div>
          )}
        </GlassCard>

        {analysis && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard className="flex flex-col items-center justify-center">
                <ScoreRing score={analysis.atsScore} label="ATS Score" />
              </GlassCard>
              <GlassCard className="flex flex-col items-center justify-center">
                <p className="text-sm text-hiremate-muted mb-2">Resume Grade</p>
                <GradeBadge grade={analysis.grade} />
              </GlassCard>
              <GlassCard className="flex flex-col items-center justify-center">
                <ScoreRing score={analysis.strength} label="Resume Strength" size="sm" />
              </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-hiremate-warning" />
                  Missing Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords.map((kw) => (
                    <span key={kw} className="badge-warning">{kw}</span>
                  ))}
                </div>
              </GlassCard>

              <GlassCard>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-hiremate-danger" />
                  Missing Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((skill) => (
                    <span key={skill} className="badge-danger">{skill}</span>
                  ))}
                </div>
              </GlassCard>

              <GlassCard>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-hiremate-success" />
                  Formatting
                </h3>
                <ul className="space-y-2 text-sm text-hiremate-muted">
                  {analysis.formattingIssues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-hiremate-success mt-0.5">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </GlassCard>

              <GlassCard>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-hiremate-secondary" />
                  Recommendations
                </h3>
                <ul className="space-y-2 text-sm text-hiremate-muted">
                  {analysis.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-hiremate-primary mt-0.5">{i + 1}.</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </div>

      <SuccessAnimation show={showSuccess} />
    </div>
  );
}
