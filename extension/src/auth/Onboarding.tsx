import { useState } from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    emoji: '👋',
    title: 'Welcome to Explain Like WhatsApp!',
    description: 'The internet is full of difficult content. We make it simple, fun, and easy to understand.',
  },
  {
    emoji: '✨',
    title: 'Highlight & Explain',
    description: 'Select any difficult text on any website. Click the floating 💬 button or press Alt+E to get instant explanations.',
  },
  {
    emoji: '🎭',
    title: '12 Explanation Modes',
    description: 'WhatsApp Mode, Hindi Mode, GenZ Mode, Exam Notes, and more! Each mode explains differently.',
  },
  {
    emoji: '📚',
    title: 'PDF & YouTube Tools',
    description: 'Simplify PDFs, summarize YouTube videos, generate study notes, and export them.',
  },
  {
    emoji: '🔥',
    title: 'Track Your Learning',
    description: 'Build streaks, earn achievements, and get daily learning reports. Like Spotify Wrapped for learning!',
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleFinish = () => {
    if (finishing) return;
    setFinishing(true);
    onComplete();
    setFinishing(false);
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="text-6xl animate-float">{current.emoji}</div>
        <h2 className="text-xl font-bold text-gray-900">{current.title}</h2>
        <p className="text-sm text-gray-500 leading-relaxed max-w-[300px]">{current.description}</p>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-brand-500' : i < step ? 'w-4 bg-brand-300' : 'w-4 bg-gray-200'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => isLast ? handleFinish() : setStep(step + 1)}
          className="btn-primary"
          disabled={finishing}
        >
          {finishing ? 'Loading...' : isLast ? "Let's Go! 🚀" : 'Next'}
        </button>

        {!isLast && (
          <button onClick={handleFinish} className="w-full text-sm text-gray-400 hover:text-gray-600">
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
