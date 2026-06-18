import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Target, FileSearch, Mic, Crown } from 'lucide-react';
import { Button } from '../components';
import { AuroraBackground } from '../components/aurora-background';

const steps = [
  {
    icon: Sparkles,
    title: 'Welcome to HireMate AI',
    description: 'Your AI career copilot. Land jobs faster, apply smarter — main character energy only. ✨',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    emoji: '🚀',
  },
  {
    icon: FileSearch,
    title: 'Glow Up Your Resume',
    description: 'Upload your resume → instant ATS score, missing keywords, and actionable tips. Resume ate and left no crumbs.',
    gradient: 'from-fuchsia-500 via-pink-500 to-rose-400',
    emoji: '📄',
  },
  {
    icon: Target,
    title: 'Match Any Job',
    description: 'LinkedIn, Indeed, Naukri, Glassdoor — we auto-scan and score your fit. Know before you apply.',
    gradient: 'from-cyan-500 via-blue-500 to-violet-500',
    emoji: '🎯',
  },
  {
    icon: Mic,
    title: 'Ace Interviews',
    description: 'AI-generated questions + model answers. Walk in confident, walk out hired.',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    emoji: '🎤',
  },
  {
    icon: Crown,
    title: 'Ready to Get Hired',
    description: 'Dream company offer letter incoming. Let\'s make it happen. You\'ve got this. 🔥',
    gradient: 'from-amber-400 via-orange-500 to-pink-500',
    emoji: '👑',
  },
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <AuroraBackground intensity="medium" />

      <div className="max-w-md w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="gradient-border-card"
          >
            <div className="inner p-8 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className={`w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br ${current.gradient} flex items-center justify-center shadow-neon text-3xl`}
              >
                {current.emoji}
              </motion.div>

              <h2 className="text-2xl font-display font-bold mb-3 display-font">{current.title}</h2>
              <p className="text-hiremate-muted mb-8 leading-relaxed text-sm">{current.description}</p>

              <div className="flex gap-1.5 justify-center mb-8">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className="h-1 rounded-full transition-all duration-500"
                    style={{
                      width: i === step ? '2rem' : i < step ? '0.75rem' : '0.25rem',
                      background: i <= step
                        ? 'linear-gradient(90deg, #8B5CF6, #F472B6)'
                        : 'rgba(255,255,255,0.08)',
                    }}
                  />
                ))}
              </div>

              <div className="flex gap-3 justify-center">
                {step > 0 && (
                  <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>
                )}
                <Button
                  onClick={() => {
                    if (isLast) onComplete();
                    else setStep(step + 1);
                  }}
                >
                  {isLast ? "Let's Go 🔥" : 'Continue'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
