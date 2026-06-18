import { useState } from 'react';
import { FREE_TRIAL_DAYS } from '@/types';

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    emoji: '👋',
    title: 'Namaste! Explain Like WhatsApp mein aapka swagat hai',
    titleEn: 'Welcome!',
    description: 'Internet par mushkil content hai? Hum use simple, fun aur samajhne layak bana dete hain — jaise WhatsApp par dost samjhata hai.',
  },
  {
    emoji: '✨',
    title: 'Text select karo, Explain karo',
    titleEn: 'Highlight & Explain',
    description: 'Kisi bhi website par mushkil text select karo. Floating 💬 button dabao ya Alt+E press karo — turant explanation milega.',
  },
  {
    emoji: '🎭',
    title: '12 Explanation Modes',
    titleEn: '12 Modes',
    description: 'WhatsApp Mode, Hindi Mode, GenZ Mode, Exam Notes, Teacher Mode aur bhi bahut! Har mode alag style mein samjhata hai.',
  },
  {
    emoji: '📚',
    title: 'PDF & YouTube Tools',
    titleEn: 'PDF & YouTube',
    description: 'PDF simplify karo, YouTube videos summarize karo, study notes banao aur export karo — sab ek jagah.',
  },
  {
    emoji: '💳',
    title: `${FREE_TRIAL_DAYS} din FREE trial + Pro Plan`,
    titleEn: 'Trial & Pro',
    description: `${FREE_TRIAL_DAYS} din bilkul free — saare modes try karo! Baad mein sirf ₹150/saal mein Pro upgrade karo. Payment ke baad turant activate.`,
  },
  {
    emoji: '🔥',
    title: 'Streaks & Achievements',
    titleEn: 'Track Learning',
    description: 'Roz seekho, streak banao, achievements unlock karo! Daily learning report bhi milti hai — Spotify Wrapped jaisa, learning ke liye.',
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="text-6xl animate-float">{current.emoji}</div>
        <p className="text-[10px] uppercase tracking-wider text-brand-500 font-semibold">{current.titleEn}</p>
        <h2 className="text-lg font-bold text-gray-900 leading-snug">{current.title}</h2>
        <p className="text-sm text-gray-500 leading-relaxed max-w-[300px]">{current.description}</p>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-brand-500' : i < step ? 'w-3 bg-brand-300' : 'w-3 bg-gray-200'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => isLast ? handleFinish() : setStep(step + 1)}
          className="btn-primary"
          disabled={finishing}
        >
          {finishing ? 'Loading...' : isLast ? 'Shuru Karte Hain! 🚀' : 'Aage Badho →'}
        </button>

        {!isLast && (
          <button onClick={handleFinish} className="w-full text-sm text-gray-400 hover:text-gray-600">
            Skip karo
          </button>
        )}
      </div>
    </div>
  );
}
