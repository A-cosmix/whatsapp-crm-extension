import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Globe, Workflow, FileText, Lightbulb, Send } from 'lucide-react';
import { Reveal } from './effects/Reveal';

const chatMessages = [
  { role: 'user', text: 'Summarize all my open research tabs' },
  { role: 'ai', text: 'I found 8 research tabs. Key themes: AI productivity (+340% adoption), remote work trends, and browser extension market growth. Want me to create a briefing doc?' },
  { role: 'user', text: 'Yes, and schedule a review for tomorrow' },
  { role: 'ai', text: 'Done. Briefing doc created, calendar event added for tomorrow 10am. I\'ve also bookmarked the 3 most relevant sources.' },
];

const aiCapabilities = [
  { icon: Bot, title: 'AI Chat Interface', desc: 'Natural conversations with full browser context' },
  { icon: Globe, title: 'Browser Assistant', desc: 'Navigate, search, and act across every tab' },
  { icon: Workflow, title: 'Smart Automation', desc: 'Build workflows that run while you sleep' },
  { icon: FileText, title: 'AI-Generated Notes', desc: 'Auto-capture insights from anything you read' },
  { icon: Lightbulb, title: 'AI Recommendations', desc: 'Proactive suggestions based on your goals' },
];

export function AIExperience() {
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (visibleMessages >= chatMessages.length) return;

    const timer = setTimeout(() => {
      if (chatMessages[visibleMessages]?.role === 'ai') {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          setVisibleMessages((v) => v + 1);
        }, 1500);
      } else {
        setVisibleMessages((v) => v + 1);
      }
    }, visibleMessages === 0 ? 1000 : 2000);

    return () => clearTimeout(timer);
  }, [visibleMessages]);

  return (
    <section id="ai" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-electric/[0.03] to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        <Reveal>
          <div className="text-center mb-16">
            <span className="section-label mb-6">
              <Bot size={14} />
              AI Experience
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              <span className="gradient-text">Intelligence</span>{' '}
              <span className="text-white">That Understands You</span>
            </h2>
            <p className="text-frost/50 max-w-xl mx-auto">
              Not just another chatbot. A cognitive layer that sees your entire digital world.
            </p>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* AI Chat Demo */}
          <Reveal direction="left">
            <div className="relative">
              <div className="gradient-border rounded-2xl overflow-hidden shadow-glow-lg">
                <div className="glass-strong px-5 py-4 flex items-center gap-3 border-b border-white/5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric to-neon flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Momentum AI</p>
                    <p className="text-[10px] text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Online
                    </p>
                  </div>
                </div>

                <div className="p-5 space-y-4 min-h-[320px] bg-void/50">
                  <AnimatePresence>
                    {chatMessages.slice(0, visibleMessages).map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-electric/20 border border-electric/30 text-frost/80'
                              : 'glass text-frost/70'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {typing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="glass rounded-2xl px-4 py-3 flex gap-1">
                        {[0, 1, 2].map((d) => (
                          <motion.div
                            key={d}
                            className="w-1.5 h-1.5 rounded-full bg-frost/40"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="p-4 border-t border-white/5">
                  <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Ask anything..."
                      className="flex-1 bg-transparent text-sm text-frost/60 placeholder:text-frost/20 outline-none"
                      readOnly
                    />
                    <button type="button" className="w-8 h-8 rounded-lg bg-electric/20 flex items-center justify-center">
                      <Send size={14} className="text-electric-bright" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Holographic effects */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-electric/20 rounded-full blur-3xl animate-pulse-glow" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-neon/15 rounded-full blur-3xl animate-pulse-glow" />
            </div>
          </Reveal>

          {/* Capabilities */}
          <div className="space-y-4">
            {aiCapabilities.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <Reveal key={cap.title} delay={i * 0.1} direction="right">
                  <motion.div
                    className="glass rounded-xl p-5 flex items-start gap-4 card-hover group"
                    whileHover={{ x: 4 }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric/20 to-neon/20 flex items-center justify-center shrink-0 group-hover:shadow-glow-sm transition-shadow">
                      <Icon size={18} className="text-electric-bright" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">{cap.title}</h3>
                      <p className="text-xs text-frost/40 leading-relaxed">{cap.desc}</p>
                    </div>
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
