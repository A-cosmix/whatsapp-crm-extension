import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, FileSearch, Target, FileText, Mic, Crown, Zap } from 'lucide-react';
import { Button } from '../components';
import { AuroraBackground } from '../components/aurora-background';

interface LandingPageProps {
  onGetStarted: () => void;
}

const features = [
  { icon: FileSearch, title: 'Resume Analyzer', desc: 'ATS scoring & optimization', color: 'from-violet-500 to-purple-400', emoji: '📄' },
  { icon: Target, title: 'Job Matcher', desc: '0-100% fit scoring', color: 'from-fuchsia-500 to-pink-400', emoji: '🎯' },
  { icon: FileText, title: 'Cover Letters', desc: '5 writing styles', color: 'from-cyan-500 to-blue-400', emoji: '✍️' },
  { icon: Mic, title: 'Interview Prep', desc: 'AI model answers', color: 'from-emerald-500 to-teal-400', emoji: '🎤' },
];

const tags = ['#GetHired', '#ATSReady', '#CareerGlowUp', '#JobHunt'];

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-hiremate-bg overflow-hidden relative">
      <AuroraBackground intensity="high" />

      <div className="relative max-w-6xl mx-auto px-6 py-12 md:py-16">
        {/* Nav */}
        <nav className="flex items-center justify-between mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-hiremate-primary via-hiremate-secondary to-hiremate-accent flex items-center justify-center shadow-neon">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-xl gradient-text-static display-font">HireMate AI</span>
              <p className="text-[10px] text-hiremate-muted tracking-widest uppercase">Career Copilot</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Button onClick={onGetStarted}>Get Started ✨</Button>
          </motion.div>
        </nav>

        {/* Hero */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            {tags.map((tag) => (
              <span key={tag} className="genz-tag">{tag}</span>
            ))}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="display-font text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 text-balance leading-[1.05] tracking-tight"
          >
            Land Jobs{' '}
            <span className="gradient-text">Faster.</span>
            <br />
            Apply{' '}
            <span className="gradient-text">Smarter.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-lg md:text-xl text-hiremate-muted mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Your AI-powered career copilot. Resume glow-up, job matching, cover letters & interview prep — all in one premium extension.{' '}
            <span className="text-hiremate-accent">No cap.</span> 🔥
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button onClick={onGetStarted} size="lg">
              <Zap className="w-5 h-5" />
              Start Free — It Hits Different
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="secondary" size="lg" onClick={onGetStarted}>
              <Crown className="w-5 h-5" />
              View Plans
            </Button>
          </motion.div>
        </div>

        <div className="shimmer-line mb-16 max-w-md mx-auto" />

        {/* Bento feature grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.5 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bento-card text-center cursor-default"
            >
              <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-glow text-2xl`}>
                {f.emoji}
              </div>
              <h3 className="font-semibold text-sm mb-1 text-hiremate-text">{f.title}</h3>
              <p className="text-xs text-hiremate-muted">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Social proof strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="gradient-border-card max-w-2xl mx-auto"
        >
          <div className="inner p-6 text-center">
            <p className="text-sm text-hiremate-muted">
              Dream company offer letter incoming.{' '}
              <span className="gradient-text-static font-semibold">You&apos;ve got this.</span> ✨
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
