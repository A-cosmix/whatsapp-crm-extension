import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Copy, Check } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Header, GlassCard, Button, Textarea, LoadingSequence } from '../components';
import { sendMessage, copyToClipboard } from '../lib/utils';
import type { ApplicationAssistant } from '@domain/entities';

export function ApplicationAssistantPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [answers, setAnswers] = useState<ApplicationAssistant | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const match = await sendMessage<{ id: string }>('MATCH_JOB', {
        jobTitle: 'Application',
        company: 'Company',
        jobDescription,
      });
      return sendMessage<ApplicationAssistant>('GENERATE_APPLICATION_ASSISTANT', { jobId: match.id });
    },
    onSuccess: setAnswers,
  });

  const handleCopy = async (field: string, text: string) => {
    await copyToClipboard(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const fields = answers ? [
    { key: 'whyHireYou', label: 'Why should we hire you?', value: answers.whyHireYou },
    { key: 'aboutYourself', label: 'Tell us about yourself', value: answers.aboutYourself },
    { key: 'expectedSalary', label: 'Expected salary', value: answers.expectedSalary },
    { key: 'shortBio', label: 'Short bio', value: answers.shortBio },
    { key: 'portfolioIntro', label: 'Portfolio introduction', value: answers.portfolioIntro },
    ...answers.customAnswers.map((a, i) => ({ key: `custom-${i}`, label: a.question, value: a.answer })),
  ] : [];

  return (
    <div>
      <Header title="Application Assistant" subtitle="Auto-fill suggestions for job applications" />
      <LoadingSequence isLoading={mutation.isPending} />

      <div className="p-8 space-y-8">
        <GlassCard className="space-y-4">
          <Textarea
            label="Job Description"
            placeholder="Paste the job description to generate tailored answers..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
          />
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending} disabled={!jobDescription}>
            <MessageSquare className="w-4 h-4" />
            Generate Answers
          </Button>
        </GlassCard>

        {answers && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {fields.map((field) => (
              <GlassCard key={field.key}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">{field.label}</h3>
                  <button
                    onClick={() => handleCopy(field.key, field.value)}
                    className="btn-ghost text-xs"
                  >
                    {copiedField === field.key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <p className="text-sm text-hiremate-muted leading-relaxed">{field.value}</p>
              </GlassCard>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
