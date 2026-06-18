import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Target, FileSearch, Mic, Crown } from 'lucide-react';
import { Button } from '../components';

const steps = [
  {
    icon: Sparkles,
    title: 'Welcome to HireMate AI',
    description: 'Your AI-powered career copilot. Land jobs faster, apply smarter, and get hired with confidence.',
    gradient: 'from-hiremate-primary to-hiremate-secondary',
  },
  {
    icon: FileSearch,
    title: 'Analyze Your Resume',
    description: 'Upload your resume and get instant ATS scoring, missing keywords, and actionable improvement tips.',
    gradient: 'from-hiremate-secondary to-purple-400',
  },
  {
    icon: Target,
    title: 'Match Any Job',
    description: 'Paste job descriptions or browse LinkedIn, Indeed, Naukri, and Glassdoor — we auto-scan and score your fit.',
    gradient: 'from-purple-400 to-hiremate-primary',
  },
  {
    icon: Mic,
    title: 'Ace Your Interviews',
    description: 'Generate likely interview questions, model answers, cover letters, and application responses with one click.',
    gradient: 'from-hiremate-primary to-hiremate-success',
  },
  {
    icon: Crown,
    title: 'Ready to Get Hired',
    description: 'Dream company offer letter incoming. Let\'s make it happen.',
    gradient: 'from-hiremate-success to-emerald-400',
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
    <div className="min-h-screen flex items-center justify-center bg-hiremate-bg p-4">
      <div className="max-w-lg w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${current.gradient} flex items-center justify-center shadow-glow`}
            >
              <Icon className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-2xl font-bold mb-3">{current.title}</h2>
            <p className="text-hiremate-muted mb-8 leading-relaxed">{current.description}</p>

            <div className="flex gap-1.5 justify-center mb-8">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? 'w-8 bg-hiremate-primary' : i < step ? 'w-4 bg-hiremate-primary/50' : 'w-1.5 bg-white/10'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              {step > 0 && (
                <Button variant="ghost" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
              <Button
                onClick={() => {
                  if (isLast) onComplete();
                  else setStep(step + 1);
                }}
              >
                {isLast ? 'Get Started' : 'Continue'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
