import { motion } from 'framer-motion';
import { ArrowRight, Chrome } from 'lucide-react';
import { Reveal } from './effects/Reveal';

export function FinalCTA() {
  return (
    <section id="cta" className="section-padding relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <div className="relative gradient-border rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-electric/10 via-neon/5 to-cyan-soft/10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-electric/20 rounded-full blur-[120px] opacity-40" />

            <div className="relative z-10 px-8 sm:px-16 py-20 sm:py-28 text-center">
              <motion.h2
                className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4"
                animate={{ opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <span className="gradient-text">Upgrade Your Mindset.</span>
              </motion.h2>
              <p className="text-xl sm:text-2xl text-white font-medium mb-3">
                Install Momentum X Today.
              </p>
              <p className="text-frost/40 max-w-lg mx-auto mb-10">
                Join over 1 million creators, developers, and thinkers who&apos;ve already reimagined their browser.
              </p>

              <motion.a
                href="#"
                className="btn-primary text-base px-10 py-4 inline-flex"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Chrome size={20} />
                Install Momentum X — Free
                <ArrowRight size={18} />
              </motion.a>

              <p className="text-xs text-frost/25 mt-6">
                Free forever plan available • No credit card required • 14-day Pro trial
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
