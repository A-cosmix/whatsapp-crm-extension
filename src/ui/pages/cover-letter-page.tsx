import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Copy, Check } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Header, GlassCard, Button, Textarea, Select, LoadingSequence } from '../components';
import { sendMessage, copyToClipboard } from '../lib/utils';
import type { CoverLetter, CoverLetterStyle } from '@domain/entities';
import { useSubscriptionStore } from '../stores';

const styles: Array<{ value: CoverLetterStyle; label: string }> = [
  { value: 'professional', label: 'Professional' },
  { value: 'startup', label: 'Startup' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'creative', label: 'Creative' },
  { value: 'tech', label: 'Tech Industry' },
];

export function CoverLetterPage() {
  const [style, setStyle] = useState<CoverLetterStyle>('professional');
  const [jobDescription, setJobDescription] = useState('');
  const [letter, setLetter] = useState<CoverLetter | null>(null);
  const [copied, setCopied] = useState(false);
  const { load: reloadUsage } = useSubscriptionStore();

  const mutation = useMutation({
    mutationFn: () =>
      sendMessage<CoverLetter>('GENERATE_COVER_LETTER', { jobId: 'temp', jobDescription, style }),
    onSuccess: (data) => {
      setLetter(data);
      reloadUsage();
    },
  });

  const handleCopy = async () => {
    if (!letter) return;
    await copyToClipboard(letter.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <Header title="Cover Letter Generator" subtitle="Personalized cover letters in your preferred style" />
      <LoadingSequence isLoading={mutation.isPending} />

      <div className="p-8 space-y-8">
        <GlassCard className="space-y-4">
          <Select
            label="Writing Style"
            value={style}
            onChange={(e) => setStyle(e.target.value as CoverLetterStyle)}
            options={styles}
          />
          <Textarea
            label="Job Description"
            placeholder="Paste the job description..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
          />
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending} disabled={!jobDescription}>
            <FileText className="w-4 h-4" />
            Generate Cover Letter
          </Button>
        </GlassCard>

        {letter && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Your Cover Letter</h3>
                  <span className="badge-primary mt-1">{letter.style}</span>
                </div>
                <Button size="sm" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-sm text-hiremate-muted whitespace-pre-wrap leading-relaxed">{letter.content}</p>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
