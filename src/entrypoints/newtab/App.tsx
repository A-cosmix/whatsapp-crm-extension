import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Settings, Sun, Moon, Search,
} from 'lucide-react';
import { useExtensionState } from '@momentum/hooks/use-extension-state';
import { useTheme } from '@momentum/components/ThemeProvider';
import { AIChat } from '@momentum/components/AIChat';
import { FocusTimer } from '@momentum/components/FocusTimer';
import { GoalsWidget } from '@momentum/components/GoalsWidget';
import { NotesWidget } from '@momentum/components/NotesWidget';
import { AnalyticsWidget } from '@momentum/components/AnalyticsWidget';
import { SummaryPanel } from '@momentum/components/SummaryPanel';
import { RemindersWidget } from '@momentum/components/RemindersWidget';

export function NewTabApp() {
  const { state, loading } = useExtensionState();
  const { resolvedTheme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  if (loading || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--mx-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'var(--mx-accent)' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl mx-glass flex items-center justify-center">
              <Sparkles size={20} style={{ color: 'var(--mx-accent)' }} />
            </div>
            <span className="text-lg font-bold">Momentum <span style={{ color: 'var(--mx-accent)' }}>X</span></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="mx-btn-ghost px-3"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="options.html" className="mx-btn-ghost px-3" aria-label="Settings">
              <Settings size={16} />
            </a>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">
            {greeting}, <span className="mx-gradient-text">Creator</span>
          </h1>
          <p className="opacity-50 mb-8">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>

          <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search the web..."
              className="mx-input pl-12 py-4 text-base rounded-2xl"
            />
          </form>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[minmax(280px,auto)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 lg:row-span-2 mx-card"
          >
            <AIChat
              initialMessages={state.chatHistory}
              voiceEnabled={state.settings.voiceEnabled}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <FocusTimer
              timer={state.timer}
              focusDuration={state.settings.focusDuration}
              breakDuration={state.settings.breakDuration}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GoalsWidget goals={state.goals} target={state.settings.dailyGoalTarget} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:row-span-2">
            <NotesWidget notes={state.notes} expanded />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <AnalyticsWidget analytics={state.analytics} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <SummaryPanel type="page" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <SummaryPanel type="youtube" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <RemindersWidget reminders={state.reminders} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
