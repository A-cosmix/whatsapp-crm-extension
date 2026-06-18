import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, FileSearch, Target, FileText, Mic, Crown } from 'lucide-react';
import { Button } from '../components';

interface LandingPageProps {
  onGetStarted: () => void;
}

const features = [
  { icon: FileSearch, title: 'AI Resume Analyzer', desc: 'ATS scoring & optimization' },
  { icon: Target, title: 'Job Matcher', desc: '0-100% fit scoring' },
  { icon: FileText, title: 'Cover Letters', desc: '5 writing styles' },
  { icon: Mic, title: 'Interview Prep', desc: 'Questions & model answers' },
];

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-hiremate-bg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow" />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-hiremate-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-hiremate-secondary/10 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-6 py-16">
        <nav className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-hiremate-primary to-hiremate-secondary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">HireMate AI</span>
          </div>
          <Button onClick={onGetStarted}>Get Started</Button>
        </nav>

        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-6 text-balance"
          >
            Land Jobs <span className="gradient-text">Faster.</span>
            <br />
            Apply <span className="gradient-text">Smarter.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-hiremate-muted mb-8 max-w-xl mx-auto"
          >
            Your AI-powered career copilot. Resume optimization, job matching, cover letters, interview prep, and more — all in one premium Chrome extension.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4 justify-center"
          >
            <Button onClick={onGetStarted} size="lg">
              <Sparkles className="w-5 h-5" />
              Start Free
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="secondary" size="lg" onClick={onGetStarted}>
              <Crown className="w-5 h-5" />
              View Plans
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.5 }}
              className="glass-card p-6 text-center hover:shadow-glow transition-shadow"
            >
              <f.icon className="w-8 h-8 text-hiremate-secondary mx-auto mb-3" />
              <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-hiremate-muted">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-hiremate-muted text-sm"
        >
          Dream company offer letter incoming. ✨
        </motion.p>
      </div>
    </div>
  );
}
