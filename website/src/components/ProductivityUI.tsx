import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bot, Target, StickyNote, Timer, TrendingUp, Cloud, Calendar,
  FileText, Search, BarChart3, Sparkles,
} from 'lucide-react';
import { Reveal } from './effects/Reveal';

interface Widget {
  id: string;
  icon: typeof Bot;
  title: string;
  subtitle: string;
  color: string;
  span: string;
  content: React.ReactNode;
}

const widgets: Widget[] = [
  {
    id: 'ai',
    icon: Bot,
    title: 'AI Assistant',
    subtitle: 'Always learning',
    color: 'from-electric/20 to-electric/5',
    span: 'col-span-2 row-span-2',
    content: (
      <div className="space-y-2 mt-3">
        <div className="glass rounded-lg p-2.5 text-xs text-frost/50">What should I focus on today?</div>
        <div className="bg-electric/10 border border-electric/20 rounded-lg p-2.5 text-xs text-frost/70">
          Based on your calendar, prioritize the Q3 review deck. You have 2 hours of focus time at 10am.
        </div>
      </div>
    ),
  },
  {
    id: 'goals',
    icon: Target,
    title: 'Daily Goals',
    subtitle: '3 of 5 complete',
    color: 'from-neon/20 to-neon/5',
    span: 'col-span-1',
    content: (
      <div className="mt-3 space-y-2">
        {[80, 60, 100, 40, 20].map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-neon to-electric rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: `${p}%` }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
              />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'notes',
    icon: StickyNote,
    title: 'Smart Notes',
    subtitle: 'Auto-organized',
    color: 'from-cyan-soft/20 to-cyan-soft/5',
    span: 'col-span-1',
    content: (
      <div className="mt-3 text-xs text-frost/40 space-y-1">
        <p className="text-frost/60">Meeting with design team</p>
        <p>• New dashboard mockups</p>
        <p>• Launch timeline Q3</p>
      </div>
    ),
  },
  {
    id: 'timer',
    icon: Timer,
    title: 'Focus Timer',
    subtitle: 'Deep work mode',
    color: 'from-green-500/20 to-green-500/5',
    span: 'col-span-1',
    content: (
      <div className="mt-3 text-center">
        <motion.p
          className="text-3xl font-bold gradient-text tabular-nums"
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          25:00
        </motion.p>
        <p className="text-[10px] text-frost/30 mt-1">Pomodoro Session</p>
      </div>
    ),
  },
  {
    id: 'habits',
    icon: TrendingUp,
    title: 'Habit Tracker',
    subtitle: '47 day streak',
    color: 'from-orange-500/20 to-orange-500/5',
    span: 'col-span-1',
    content: (
      <div className="mt-3 flex gap-1">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-6 rounded ${i < 5 ? 'bg-gradient-to-t from-orange-500/40 to-orange-400/20' : 'bg-white/5'}`}
          />
        ))}
      </div>
    ),
  },
  {
    id: 'weather',
    icon: Cloud,
    title: 'Weather',
    subtitle: 'San Francisco',
    color: 'from-sky-500/20 to-sky-500/5',
    span: 'col-span-1',
    content: (
      <div className="mt-3 flex items-center gap-2">
        <span className="text-2xl">☀️</span>
        <div>
          <p className="text-lg font-semibold text-white">72°</p>
          <p className="text-[10px] text-frost/30">Sunny</p>
        </div>
      </div>
    ),
  },
  {
    id: 'calendar',
    icon: Calendar,
    title: 'Calendar',
    subtitle: 'Next: Team standup',
    color: 'from-pink-500/20 to-pink-500/5',
    span: 'col-span-1',
    content: (
      <div className="mt-3 space-y-1.5">
        {['10:00 Standup', '14:00 Design Review', '16:00 1:1'].map((e) => (
          <div key={e} className="text-[10px] text-frost/50 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-pink-400" />
            {e}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'summaries',
    icon: FileText,
    title: 'AI Summaries',
    subtitle: '12 articles today',
    color: 'from-violet-500/20 to-violet-500/5',
    span: 'col-span-1',
    content: (
      <div className="mt-3 text-[10px] text-frost/40 leading-relaxed">
        Key insight: AI productivity tools saw 340% growth in enterprise adoption...
      </div>
    ),
  },
  {
    id: 'search',
    icon: Search,
    title: 'Smart Search',
    subtitle: '⌘ + K',
    color: 'from-white/10 to-white/5',
    span: 'col-span-1',
    content: (
      <div className="mt-3 glass rounded-lg px-3 py-2 text-[10px] text-frost/30 flex items-center gap-2">
        <Search size={10} />
        Search anything...
      </div>
    ),
  },
  {
    id: 'analytics',
    icon: BarChart3,
    title: 'Analytics',
    subtitle: '+23% this week',
    color: 'from-electric/20 to-neon/10',
    span: 'col-span-2',
    content: (
      <div className="mt-3 flex items-end gap-1.5 h-16">
        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 bg-gradient-to-t from-electric/60 to-neon/30 rounded-sm"
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
          />
        ))}
      </div>
    ),
  },
];

export function ProductivityUI() {
  const [activeWidget, setActiveWidget] = useState<string | null>(null);

  return (
    <section className="section-padding relative">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <span className="section-label mb-6">
              <Sparkles size={14} />
              Live Dashboard
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              <span className="gradient-text">Productivity</span>{' '}
              <span className="text-white">at Light Speed</span>
            </h2>
            <p className="text-frost/50 max-w-xl mx-auto">
              Ten intelligent widgets. One unified command center. Everything you need, floating at your fingertips.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 auto-rows-[minmax(140px,auto)]">
          {widgets.map((widget, i) => {
            const Icon = widget.icon;
            const isActive = activeWidget === widget.id;

            return (
              <Reveal key={widget.id} delay={i * 0.05}>
                <motion.div
                  className={`${widget.span} glass rounded-2xl p-4 sm:p-5 card-hover cursor-pointer relative overflow-hidden`}
                  onHoverStart={() => setActiveWidget(widget.id)}
                  onHoverEnd={() => setActiveWidget(null)}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${widget.color} opacity-0 transition-opacity duration-500 ${isActive ? 'opacity-100' : ''}`} />

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={16} className="text-electric-bright" />
                      <span className="text-sm font-medium text-white">{widget.title}</span>
                    </div>
                    <p className="text-[10px] text-frost/30">{widget.subtitle}</p>
                    {widget.content}
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
