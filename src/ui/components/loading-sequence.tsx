import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { LOADING_STEPS } from '@application/dto';
import { useEffect, useState } from 'react';

interface LoadingSequenceProps {
  isLoading: boolean;
  onComplete?: () => void;
}

export function LoadingSequence({ isLoading, onComplete }: LoadingSequenceProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setStep(0);
      return;
    }

    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev < LOADING_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && step > 0) {
      onComplete?.();
    }
  }, [isLoading, step, onComplete]);

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-hiremate-bg/90 backdrop-blur-sm"
    >
      <div className="glass-card p-8 max-w-md w-full mx-4 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-hiremate-primary to-hiremate-secondary flex items-center justify-center"
        >
          <Loader2 className="w-8 h-8 text-white" />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg font-medium text-hiremate-text mb-4"
          >
            {LOADING_STEPS[step]}
          </motion.p>
        </AnimatePresence>

        <div className="flex gap-1.5 justify-center">
          {LOADING_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= step ? 'w-8 bg-hiremate-primary' : 'w-1.5 bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function SuccessAnimation({ show, message = 'Ready to get hired.' }: { show: boolean; message?: string }) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-hiremate-bg/90 backdrop-blur-sm"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-hiremate-success to-emerald-400 flex items-center justify-center shadow-glow"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl"
          >
            ✓
          </motion.span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold gradient-text"
        >
          {message}
        </motion.p>
      </div>
    </motion.div>
  );
}
