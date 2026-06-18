import { useState } from 'react';
import { FileText, Youtube, Loader2, Copy, Check } from 'lucide-react';
import { MessageTypes, sendMessage } from '../lib/messages';

interface SummaryPanelProps {
  type: 'page' | 'youtube';
}

export function SummaryPanel({ type }: SummaryPanelProps) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const summarize = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('No active tab');

      const response = await chrome.tabs.sendMessage(tab.id, {
        type: type === 'youtube' ? 'MX_GET_YOUTUBE_DATA' : 'MX_GET_PAGE_CONTENT',
      });

      const result = await sendMessage<string>(
        type === 'youtube' ? MessageTypes.SUMMARIZE_YOUTUBE : MessageTypes.SUMMARIZE_PAGE,
        response,
      );
      setSummary(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Summarization failed');
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-card">
      <div className="flex items-center gap-2 mb-4">
        {type === 'youtube' ? <Youtube size={16} style={{ color: 'var(--mx-accent)' }} /> : <FileText size={16} style={{ color: 'var(--mx-accent)' }} />}
        <p className="text-sm font-medium">
          {type === 'youtube' ? 'YouTube Summarizer' : 'Page Summarizer'}
        </p>
      </div>

      <button type="button" onClick={summarize} disabled={loading} className="mx-btn-primary w-full mb-4">
        {loading ? <><Loader2 size={14} className="animate-spin" /> Summarizing...</> : `Summarize ${type === 'youtube' ? 'Video' : 'Page'}`}
      </button>

      {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

      {summary && (
        <div className="relative">
          <div className="mx-glass rounded-xl p-4 text-sm leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap">
            {summary}
          </div>
          <button
            type="button"
            onClick={copy}
            className="absolute top-2 right-2 p-1.5 mx-glass rounded-lg opacity-60 hover:opacity-100"
            aria-label="Copy summary"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      )}
    </div>
  );
}
