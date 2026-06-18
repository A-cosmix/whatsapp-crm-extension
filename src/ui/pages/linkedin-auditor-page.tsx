import { useState } from 'react';
import { motion } from 'framer-motion';
import { Linkedin, TrendingUp } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Header, GlassCard, ScoreRing, Button, Textarea, LoadingSequence } from '../components';
import { sendMessage } from '../lib/utils';
import type { LinkedInAudit } from '@domain/entities';

export function LinkedInAuditorPage() {
  const [profileContent, setProfileContent] = useState('');
  const [audit, setAudit] = useState<LinkedInAudit | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      sendMessage<LinkedInAudit>('AUDIT_LINKEDIN', { profileContent }),
    onSuccess: setAudit,
  });

  return (
    <div>
      <Header title="LinkedIn Profile Auditor" subtitle="Optimize your profile for maximum visibility" />
      <LoadingSequence isLoading={mutation.isPending} />

      <div className="p-8 space-y-8">
        <GlassCard className="space-y-4">
          <Textarea
            label="LinkedIn Profile Content"
            placeholder="Paste your LinkedIn headline, about section, and experience..."
            value={profileContent}
            onChange={(e) => setProfileContent(e.target.value)}
            rows={8}
          />
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending} disabled={profileContent.length < 50}>
            <Linkedin className="w-4 h-4" />
            Audit Profile
          </Button>
        </GlassCard>

        {audit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <GlassCard className="flex flex-col items-center"><ScoreRing score={audit.profileScore} label="Profile Score" size="sm" /></GlassCard>
              <GlassCard className="flex flex-col items-center"><ScoreRing score={audit.headlineScore} label="Headline" size="sm" /></GlassCard>
              <GlassCard className="flex flex-col items-center"><ScoreRing score={audit.experienceQuality} label="Experience" size="sm" /></GlassCard>
              <GlassCard className="flex flex-col items-center"><ScoreRing score={audit.keywordOptimization} label="Keywords" size="sm" /></GlassCard>
            </div>

            <GlassCard>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-hiremate-success" />
                Improvement Suggestions
              </h3>
              <ul className="space-y-3">
                {audit.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-hiremate-muted">
                    <span className="w-6 h-6 rounded-full bg-hiremate-primary/20 text-hiremate-secondary flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
