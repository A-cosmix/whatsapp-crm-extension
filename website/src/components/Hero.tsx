import { motion } from 'framer-motion';
import { Play, Chrome, Star, Users, ArrowRight } from 'lucide-react';
import { Reveal } from './effects/Reveal';

const floatingCards = [
  { label: 'AI Summary', value: '12 articles', x: '-120%', y: '10%', delay: 0.5 },
  { label: 'Focus Score', value: '94%', x: '115%', y: '25%', delay: 0.8 },
  { label: 'Tasks Done', value: '8/10', x: '-110%', y: '70%', delay: 1.1 },
  { label: 'Streak', value: '47 days', x: '110%', y: '65%', delay: 1.4 },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
      <div className="absolute inset-0 bg-hero-glow" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 w-full">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Reveal>
            <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
              <span className="section-label">
                <Chrome size={14} />
                Chrome Extension
              </span>
              <span className="text-xs text-frost/30">•</span>
              <span className="text-xs text-frost/40">Now with GPT-5 Integration</span>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6">
              <span className="gradient-text">Your Browser.</span>
              <br />
              <span className="text-white">Reimagined.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-lg sm:text-xl text-frost/50 max-w-2xl mx-auto mb-10 text-balance leading-relaxed">
              The world&apos;s smartest productivity extension powered by AI.
              Transform every tab into a command center for your mind.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="flex items-center justify-center gap-4 flex-wrap mb-12">
              <a href="#cta" className="btn-primary group">
                Install Extension
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
              <button type="button" className="btn-secondary group">
                <Play size={16} className="text-electric-bright" />
                Watch Demo
              </button>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap text-sm">
              <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
                <Chrome size={16} className="text-electric-bright" />
                <span className="text-frost/60">Chrome Web Store</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-electric-bright" />
                <span className="text-frost/60"><strong className="text-white font-semibold">1M+</strong> users</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                ))}
                <span className="text-frost/60 ml-1"><strong className="text-white font-semibold">4.9</strong> rating</span>
              </div>
            </div>
            <p className="text-xs text-frost/30 mt-4 tracking-wide">
              Trusted by creators, developers &amp; productivity experts worldwide
            </p>
          </Reveal>
        </div>

        {/* Browser Mockup */}
        <Reveal delay={0.5}>
          <div className="relative max-w-5xl mx-auto">
            {floatingCards.map((card, i) => (
              <motion.div
                key={i}
                className="absolute hidden lg:block glass rounded-xl px-4 py-3 z-20"
                style={{ left: '50%', top: card.y }}
                initial={{ opacity: 0, x: 0 }}
                animate={{
                  opacity: 1,
                  x: card.x,
                  y: [0, -8, 0],
                }}
                transition={{
                  opacity: { delay: card.delay, duration: 0.6 },
                  x: { delay: card.delay, duration: 0.6 },
                  y: { delay: card.delay + 0.6, duration: 4, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                <p className="text-[10px] text-frost/40 uppercase tracking-wider">{card.label}</p>
                <p className="text-sm font-semibold text-white">{card.value}</p>
              </motion.div>
            ))}

            <motion.div
              className="relative gradient-border rounded-2xl overflow-hidden shadow-glow-xl"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Browser Chrome */}
              <div className="glass-strong px-4 py-3 flex items-center gap-3 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 glass rounded-lg px-4 py-1.5 text-xs text-frost/30 text-center">
                  momentum-x.app/dashboard
                </div>
              </div>

              {/* Dashboard Preview */}
              <div className="bg-void/90 p-6 min-h-[400px] sm:min-h-[480px]">
                <div className="grid grid-cols-12 gap-4 h-full">
                  {/* Sidebar */}
                  <div className="col-span-2 hidden sm:block space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-8 rounded-lg ${i === 0 ? 'bg-electric/20 border border-electric/30' : 'bg-white/[0.03]'}`}
                      />
                    ))}
                  </div>

                  {/* Main Content */}
                  <div className="col-span-12 sm:col-span-7 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-3 w-32 bg-white/10 rounded mb-2" />
                        <div className="h-2 w-48 bg-white/[0.05] rounded" />
                      </div>
                      <div className="h-8 w-24 bg-electric/20 rounded-lg border border-electric/20" />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {['Focus', 'Tasks', 'Goals'].map((label) => (
                        <div key={label} className="glass rounded-xl p-4">
                          <p className="text-[10px] text-frost/30 mb-2">{label}</p>
                          <div className="h-6 w-12 bg-gradient-to-r from-electric/40 to-neon/40 rounded" />
                        </div>
                      ))}
                    </div>

                    <div className="glass rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-electric to-neon" />
                        <div className="h-2 w-24 bg-white/10 rounded" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 w-full bg-white/[0.05] rounded" />
                        <div className="h-2 w-3/4 bg-white/[0.05] rounded" />
                        <div className="h-2 w-1/2 bg-electric/20 rounded" />
                      </div>
                    </div>
                  </div>

                  {/* Right Panel - AI Chat */}
                  <div className="col-span-12 sm:col-span-3 glass rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[10px] text-frost/40 uppercase tracking-wider">AI Assistant</span>
                    </div>
                    <div className="space-y-2">
                      <div className="glass rounded-lg p-2 text-[10px] text-frost/50">
                        Summarize my open tabs
                      </div>
                      <div className="bg-electric/10 border border-electric/20 rounded-lg p-2 text-[10px] text-frost/60">
                        Found 12 tabs. Here&apos;s your briefing...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="absolute -inset-4 bg-gradient-to-r from-electric/10 via-neon/5 to-cyan-soft/10 rounded-3xl blur-3xl -z-10 opacity-60" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
