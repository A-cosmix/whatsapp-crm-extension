import { useState } from 'react';
import { motion } from 'framer-motion';
import { Map, BookOpen, Code, FolderOpen } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Header, GlassCard, Button, Input, LoadingSequence } from '../components';
import { sendMessage } from '../lib/utils';
import type { CareerRoadmap } from '@domain/entities';

export function CareerRoadmapPage() {
  const [dreamJob, setDreamJob] = useState('');
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      sendMessage<CareerRoadmap>('GENERATE_ROADMAP', { dreamJob }),
    onSuccess: setRoadmap,
  });

  const PlanSection = ({ title, milestones }: { title: string; milestones: CareerRoadmap['plan30Day'] }) => (
    <GlassCard>
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {milestones.map((m, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-hiremate-primary/20 text-hiremate-secondary flex items-center justify-center text-xs font-bold shrink-0">
              {i + 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{m.title}</p>
                <span className="text-[10px] text-hiremate-muted bg-white/5 px-2 py-0.5 rounded">{m.duration}</span>
              </div>
              <p className="text-xs text-hiremate-muted mt-1">{m.description}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );

  return (
    <div>
      <Header title="Career Roadmap" subtitle="AI-generated path to your dream job" />
      <LoadingSequence isLoading={mutation.isPending} />

      <div className="p-8 space-y-8">
        <GlassCard className="space-y-4">
          <Input
            label="Dream Job"
            placeholder="e.g. Frontend Developer at a FAANG company"
            value={dreamJob}
            onChange={(e) => setDreamJob(e.target.value)}
          />
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending} disabled={!dreamJob}>
            <Map className="w-4 h-4" />
            Generate Roadmap
          </Button>
        </GlassCard>

        {roadmap && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <GlassCard className="bg-gradient-to-br from-hiremate-primary/10 to-transparent text-center p-6">
              <h2 className="text-2xl font-bold gradient-text">Path to {roadmap.dreamJob}</h2>
            </GlassCard>

            <PlanSection title="30-Day Plan" milestones={roadmap.plan30Day} />
            <PlanSection title="90-Day Plan" milestones={roadmap.plan90Day} />
            <PlanSection title="6-Month Plan" milestones={roadmap.plan6Month} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <GlassCard>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Code className="w-4 h-4 text-hiremate-secondary" />
                  Skills to Learn
                </h3>
                <ul className="space-y-2">
                  {roadmap.skillsToLearn.map((s, i) => (
                    <li key={i} className="text-sm text-hiremate-muted flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-hiremate-primary" />
                      {s}
                    </li>
                  ))}
                </ul>
              </GlassCard>

              <GlassCard>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-hiremate-warning" />
                  Recommended Courses
                </h3>
                <ul className="space-y-2">
                  {roadmap.courses.map((c, i) => (
                    <li key={i} className="text-sm text-hiremate-muted flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-hiremate-warning" />
                      {c}
                    </li>
                  ))}
                </ul>
              </GlassCard>

              <GlassCard>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-hiremate-success" />
                  Projects to Build
                </h3>
                <ul className="space-y-2">
                  {roadmap.projects.map((p, i) => (
                    <li key={i} className="text-sm text-hiremate-muted flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-hiremate-success" />
                      {p}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
