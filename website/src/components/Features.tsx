import { motion } from 'framer-motion';
import {
  Brain, Focus, FileSearch, BarChart3, RefreshCw, LayoutDashboard,
  Mic, Bell, Palette, Zap,
} from 'lucide-react';
import { Reveal } from './effects/Reveal';

interface Feature {
  icon: typeof Brain;
  title: string;
  description: string;
  span: string;
  gradient: string;
}

const features: Feature[] = [
  {
    icon: Brain,
    title: 'AI Workspace',
    description: 'An intelligent layer that understands your workflow and adapts in real-time.',
    span: 'md:col-span-2 md:row-span-2',
    gradient: 'from-electric/30 via-electric/10 to-transparent',
  },
  {
    icon: Focus,
    title: 'Smart Focus Mode',
    description: 'Block distractions intelligently. AI learns your peak hours.',
    span: 'md:col-span-1',
    gradient: 'from-neon/30 via-neon/10 to-transparent',
  },
  {
    icon: FileSearch,
    title: 'Instant Summaries',
    description: 'TL;DR any page, video, or document in seconds.',
    span: 'md:col-span-1',
    gradient: 'from-cyan-soft/30 via-cyan-soft/10 to-transparent',
  },
  {
    icon: BarChart3,
    title: 'Productivity Analytics',
    description: 'Deep insights into how you spend your digital time.',
    span: 'md:col-span-1',
    gradient: 'from-violet-500/30 via-violet-500/10 to-transparent',
  },
  {
    icon: RefreshCw,
    title: 'Cross-device Sync',
    description: 'Seamless sync across all your devices instantly.',
    span: 'md:col-span-1',
    gradient: 'from-green-500/30 via-green-500/10 to-transparent',
  },
  {
    icon: LayoutDashboard,
    title: 'Minimal Dashboard',
    description: 'Beautiful, distraction-free interface designed for flow state.',
    span: 'md:col-span-1',
    gradient: 'from-pink-500/30 via-pink-500/10 to-transparent',
  },
  {
    icon: Mic,
    title: 'Voice AI Assistant',
    description: 'Hands-free commands. Just speak and Momentum executes.',
    span: 'md:col-span-1',
    gradient: 'from-orange-500/30 via-orange-500/10 to-transparent',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'AI-filtered alerts. Only what matters, when it matters.',
    span: 'md:col-span-1',
    gradient: 'from-yellow-500/30 via-yellow-500/10 to-transparent',
  },
  {
    icon: Palette,
    title: 'Infinite Customization',
    description: 'Themes, layouts, widgets — make it unmistakably yours.',
    span: 'md:col-span-2',
    gradient: 'from-electric/20 via-neon/15 to-cyan-soft/10',
  },
];

export function Features() {
  return (
    <section id="features" className="section-padding relative">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <span className="section-label mb-6">
              <Zap size={14} />
              Features
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              <span className="text-white">Built for the</span>{' '}
              <span className="gradient-text">Next Generation</span>
            </h2>
            <p className="text-frost/50 max-w-xl mx-auto">
              Every feature engineered to eliminate friction and amplify your creative output.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={i * 0.06}>
                <motion.div
                  className={`${feature.span} group relative glass rounded-2xl p-6 sm:p-8 overflow-hidden card-hover h-full`}
                  whileHover={{ scale: 1.01 }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                  />

                  <div className="relative z-10 h-full flex flex-col">
                    <div className="w-10 h-10 rounded-xl glass flex items-center justify-center mb-4 group-hover:shadow-glow-sm transition-shadow duration-500">
                      <Icon size={20} className="text-electric-bright" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-frost/40 leading-relaxed flex-1">{feature.description}</p>

                    <motion.div
                      className="mt-4 h-px w-0 group-hover:w-full bg-gradient-to-r from-electric/50 to-neon/50 transition-all duration-700"
                    />
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
