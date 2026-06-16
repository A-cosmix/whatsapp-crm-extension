import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Key, Layout, ArrowRight, Check } from 'lucide-react';
import { MessageTypes, sendMessage } from '@momentum/lib/messages';

const STEPS = [
  {
    title: 'Welcome to Momentum X',
    subtitle: 'Your browser, reimagined for peak productivity.',
    icon: Sparkles,
  },
  {
    title: 'Connect Your AI',
    subtitle: 'Add your OpenAI API key to unlock the full AI experience.',
    icon: Key,
  },
  {
    title: 'Your Command Center',
    subtitle: 'New tab dashboard, AI sidebar, focus timer, goals, notes, and more — all in one place.',
    icon: Layout,
  },
];

export function OnboardingApp() {
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [done, setDone] = useState(false);

  const finish = async () => {
    await sendMessage(MessageTypes.UPDATE_SETTINGS, {
      apiKey,
      onboardingComplete: true,
    });
    setDone(true);
    setTimeout(() => window.close(), 1500);
  };

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-6" data-theme="dark" data-accent="electric">
      <div className="max-w-md w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="mx-card p-8 text-center"
          >
            {done ? (
              <div>
                <div className="w-16 h-16 rounded-2xl mx-btn-primary mx-auto mb-4 flex items-center justify-center">
                  <Check size={32} />
                </div>
                <h2 className="text-xl font-bold mb-2">You&apos;re all set!</h2>
                <p className="opacity-50 text-sm">Opening your new productivity command center...</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl mx-glass mx-auto mb-6 flex items-center justify-center">
                  <Icon size={28} style={{ color: 'var(--mx-accent)' }} />
                </div>
                <h2 className="text-2xl font-bold mb-2">{current.title}</h2>
                <p className="opacity-50 text-sm mb-8">{current.subtitle}</p>

                {step === 1 && (
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-... (OpenAI API Key)"
                    className="mx-input mb-6 text-center"
                  />
                )}

                <div className="flex gap-1.5 justify-center mb-8">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className="h-1 rounded-full transition-all duration-300"
                      style={{
                        width: i === step ? 24 : 8,
                        background: i <= step ? 'var(--mx-accent)' : 'var(--mx-border)',
                      }}
                    />
                  ))}
                </div>

                <div className="flex gap-3">
                  {step > 0 && (
                    <button type="button" onClick={() => setStep(step - 1)} className="mx-btn-ghost flex-1">
                      Back
                    </button>
                  )}
                  {step < STEPS.length - 1 ? (
                    <button type="button" onClick={() => setStep(step + 1)} className="mx-btn-primary flex-1">
                      Continue <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button type="button" onClick={finish} className="mx-btn-primary flex-1">
                      Get Started <ArrowRight size={16} />
                    </button>
                  )}
                </div>

                {step === 1 && (
                  <button type="button" onClick={() => setStep(2)} className="text-xs opacity-30 mt-4 hover:opacity-60">
                    Skip for now
                  </button>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
