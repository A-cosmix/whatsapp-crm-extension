import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { Reveal } from './effects/Reveal';

const faqs = [
  {
    q: 'What is Momentum X?',
    a: 'Momentum X is an AI-powered Chrome extension that transforms your browser into an intelligent productivity command center. It includes AI summaries, focus tools, smart widgets, and automation — all in one beautiful interface.',
  },
  {
    q: 'Is my data safe and private?',
    a: 'Absolutely. Momentum X processes data locally whenever possible. AI requests are encrypted end-to-end, and we never sell your data. You can review our full privacy policy for details.',
  },
  {
    q: 'Does it work with other browsers?',
    a: 'Currently optimized for Chrome and Chromium-based browsers (Arc, Brave, Edge). Firefox support is on our roadmap for Q3 2026.',
  },
  {
    q: 'Can I try Pro before paying?',
    a: 'Yes! Every new user gets a 14-day free trial of Pro with full access to all features. No credit card required to start.',
  },
  {
    q: 'How does the AI assistant work?',
    a: 'Our AI has full context of your open tabs, bookmarks, and notes (with your permission). It uses state-of-the-art language models to understand, summarize, and act on your digital workspace.',
  },
  {
    q: 'Can I use Momentum X for my team?',
    a: 'Ultra AI includes team collaboration features with shared workspaces, admin controls, and centralized billing. Contact us for enterprise pricing on teams of 50+.',
  },
  {
    q: 'What happens if I cancel?',
    a: 'You can cancel anytime from your dashboard. Your data remains accessible on the Free plan, and you won\'t be charged again. We believe in earning your subscription every month.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section-padding relative">
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              <span className="gradient-text">Questions?</span>{' '}
              <span className="text-white">Answered.</span>
            </h2>
            <p className="text-frost/50">
              Everything you need to know about Momentum X.
            </p>
          </div>
        </Reveal>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <Reveal key={faq.q} delay={i * 0.05}>
                <div className="glass rounded-xl overflow-hidden">
                  <button
                    type="button"
                    className="w-full px-6 py-5 flex items-center justify-between text-left group"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-medium text-white group-hover:text-electric-bright transition-colors pr-4">
                      {faq.q}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="shrink-0"
                    >
                      {isOpen ? (
                        <Minus size={16} className="text-frost/40" />
                      ) : (
                        <Plus size={16} className="text-frost/40" />
                      )}
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                      >
                        <div className="px-6 pb-5">
                          <p className="text-sm text-frost/50 leading-relaxed">{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
