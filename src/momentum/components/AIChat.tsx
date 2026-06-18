import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Trash2, Bot, Loader2 } from 'lucide-react';
import { useAIChat } from '../hooks/use-ai';
import { useVoice } from '../hooks/use-voice';
import type { ChatMessage } from '../types';

interface AIChatProps {
  initialMessages?: ChatMessage[];
  compact?: boolean;
  voiceEnabled?: boolean;
}

export function AIChat({ initialMessages = [], compact = false, voiceEnabled = true }: AIChatProps) {
  const { messages, loading, error, send, clear } = useAIChat(initialMessages);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { listening, supported, start, stop } = useVoice((text) => {
    setInput(text);
    send(text);
  }, voiceEnabled);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    send(input);
    setInput('');
  };

  return (
    <div className={`flex flex-col ${compact ? 'h-full' : 'h-[500px]'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl mx-glass flex items-center justify-center">
            <Bot size={16} style={{ color: 'var(--mx-accent)' }} />
          </div>
          <div>
            <p className="text-sm font-medium">Momentum AI</p>
            <p className="text-[10px] opacity-50">GPT-powered assistant</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button type="button" onClick={clear} className="p-2 opacity-40 hover:opacity-80 transition-opacity" aria-label="Clear chat">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
        {messages.length === 0 && (
          <div className="text-center py-8 opacity-40">
            <Bot size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Ask me anything about your productivity</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {['Summarize my day', 'Help me focus', 'Review my goals'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="text-xs mx-glass px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user' ? 'mx-btn-primary' : 'mx-glass'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex items-center gap-2 opacity-50 text-sm">
            <Loader2 size={14} className="animate-spin" />
            Thinking...
          </div>
        )}

        {error && (
          <div className="text-xs text-red-400 mx-glass rounded-lg p-3">{error}</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Momentum AI..."
          className="mx-input flex-1"
          disabled={loading}
        />
        {supported && voiceEnabled && (
          <button
            type="button"
            onClick={listening ? stop : start}
            className={`mx-btn-ghost px-3 ${listening ? 'ring-2 ring-red-500' : ''}`}
            aria-label="Voice input"
          >
            <Mic size={16} />
          </button>
        )}
        <button type="submit" disabled={loading || !input.trim()} className="mx-btn-primary px-3">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
