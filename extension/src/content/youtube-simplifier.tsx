import { useState, useEffect } from 'react';
import type { ExplanationMode } from '@/types';

export function YouTubeSimplifier() {
  const [visible, setVisible] = useState(false);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkPage = () => {
      setVisible(window.location.pathname.includes('/watch'));
    };
    checkPage();
    window.addEventListener('popstate', checkPage);
    return () => window.removeEventListener('popstate', checkPage);
  }, []);

  const getVideoInfo = () => {
    const title = document.querySelector('h1.ytd-watch-metadata yt-formatted-string, h1.title')?.textContent || document.title;
    const description = document.querySelector('#description-inline-expander, #description')?.textContent || '';
    const transcriptEls = document.querySelectorAll('.ytd-transcript-segment-renderer, .segment-text');
    let transcript = '';
    transcriptEls.forEach((el) => { transcript += el.textContent + ' '; });
    if (!transcript) transcript = description;
    return { title, transcript, url: window.location.href };
  };

  const handleSummarize = async (mode: ExplanationMode = 'whatsapp') => {
    setLoading(true);
    setError('');
    setSummary('');

    const { title, transcript, url } = getVideoInfo();
    if (!transcript || transcript.length < 20) {
      setError('Could not find video content. Try opening the transcript first.');
      setLoading(false);
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SUMMARIZE_YOUTUBE',
        payload: { videoTitle: title, videoUrl: url, transcript, mode },
      });
      if (response.success) {
        setSummary(response.summary);
      } else {
        setError(response.error || 'Failed to summarize');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div style={{ position: 'fixed', bottom: '80px', right: '20px', zIndex: 9999, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {!summary && !loading && (
        <button
          onClick={() => handleSummarize()}
          className="elw-gradient"
          style={{
            padding: '12px 20px', borderRadius: '24px', border: 'none', color: 'white',
            cursor: 'pointer', fontWeight: 600, fontSize: '14px',
            boxShadow: '0 4px 20px rgba(37, 211, 102, 0.5)', display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          📺 Simplify Video
        </button>
      )}

      {(summary || loading || error) && (
        <div
          className="elw-glass"
          style={{
            width: '380px', maxHeight: '500px', borderRadius: '16px', overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          <div className="elw-gradient" style={{ padding: '12px 16px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700 }}>📺 Video Simplified</span>
            <button onClick={() => { setSummary(''); setError(''); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}>×</button>
          </div>
          <div style={{ padding: '16px', maxHeight: '400px', overflowY: 'auto', fontSize: '14px', lineHeight: 1.6 }}>
            {loading && <div style={{ textAlign: 'center', color: '#9ca3af' }}>✨ Simplifying video...</div>}
            {error && <div style={{ color: '#ef4444' }}>{error}</div>}
            {summary && <div style={{ whiteSpace: 'pre-wrap', color: '#1f2937' }}>{summary}</div>}
          </div>
          {summary && (
            <div style={{ padding: '8px 16px', borderTop: '1px solid #f3f4f6' }}>
              <button
                onClick={() => navigator.clipboard.writeText(summary)}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: 'none', background: '#25D366', color: 'white', cursor: 'pointer', fontWeight: 600 }}
              >
                📋 Copy Study Notes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
