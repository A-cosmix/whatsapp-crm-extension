import { useState, useEffect } from 'react';
import { EXPLANATION_MODES, type ExplanationMode } from '@/types';
import { sendMessage, EXTENSION_RELOAD_MESSAGE, isContextInvalidError, autoReloadIfContextDead, clearContextReloadFlag } from '@/utils/helpers';

interface ExplainPopupProps {
  text: string;
  defaultMode: ExplanationMode;
  onClose: () => void;
}

export function ExplainPopup({ text, defaultMode, onClose }: ExplainPopupProps) {
  const [mode, setMode] = useState<ExplanationMode>(defaultMode);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModes, setShowModes] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateExplanation(mode);
  }, []);

  const generateExplanation = async (selectedMode: ExplanationMode) => {
    setLoading(true);
    setError('');
    setMode(selectedMode);

    try {
      const response = await sendMessage<{
        success: boolean;
        explanation?: string;
        error?: string;
      }>('EXPLAIN_TEXT', {
        text,
        mode: selectedMode,
        url: window.location.href,
        pageTitle: document.title,
      });

      if (response?.success) {
        clearContextReloadFlag();
        setExplanation(response.explanation || '');
      } else {
        setError(response?.error || 'Failed to generate explanation');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      if (isContextInvalidError(msg)) {
        if (autoReloadIfContextDead()) return;
        setError(EXTENSION_RELOAD_MESSAGE);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareText = `💬 Explain Like WhatsApp\n\nOriginal: "${text.slice(0, 100)}..."\n\n${explanation}\n\nGet the extension: https://explainlikewhatsapp.com`;
    if (navigator.share) {
      await navigator.share({ title: 'Explain Like WhatsApp', text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentMode = EXPLANATION_MODES.find((m) => m.id === mode);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483647,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="elw-glass"
        style={{
          width: '420px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          animation: 'slide-up 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div
          className="elw-gradient"
          style={{ padding: '16px 20px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>{currentMode?.emoji || '💬'}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>Explain Like WhatsApp</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>{currentMode?.name}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: 'white', fontSize: '18px' }}
          >
            ×
          </button>
        </div>

        {/* Original Text */}
        <div style={{ padding: '12px 20px', background: '#f0fdf4', borderBottom: '1px solid #dcfce7' }}>
          <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, marginBottom: '4px' }}>ORIGINAL</div>
          <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5, maxHeight: '60px', overflow: 'hidden' }}>
            {text.slice(0, 200)}{text.length > 200 ? '...' : ''}
          </div>
        </div>

        {/* Mode Selector */}
        <div style={{ padding: '8px 20px', display: 'flex', gap: '6px', overflowX: 'auto', borderBottom: '1px solid #f3f4f6' }}>
          <button
            onClick={() => setShowModes(!showModes)}
            style={{
              padding: '4px 12px',
              borderRadius: '16px',
              border: '1px solid #25D366',
              background: 'white',
              color: '#16a34a',
              fontSize: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontWeight: 600,
            }}
          >
            {showModes ? '✕ Close' : '🎭 Change Mode'}
          </button>
        </div>

        {showModes && (
          <div style={{ padding: '8px 20px', display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
            {EXPLANATION_MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => { generateExplanation(m.id); setShowModes(false); }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  border: mode === m.id ? '2px solid #25D366' : '1px solid #e5e7eb',
                  background: mode === m.id ? '#f0fdf4' : 'white',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {m.emoji} {m.name}
                {m.isPremium && <span style={{ fontSize: '10px' }}>⭐</span>}
              </button>
            ))}
          </div>
        )}

        {/* Explanation */}
        <div style={{ padding: '16px 20px', minHeight: '120px', maxHeight: '300px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="elw-shimmer" style={{ height: '16px', borderRadius: '8px', width: '90%' }} />
              <div className="elw-shimmer" style={{ height: '16px', borderRadius: '8px', width: '75%' }} />
              <div className="elw-shimmer" style={{ height: '16px', borderRadius: '8px', width: '60%' }} />
              <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', marginTop: '8px' }}>
                ✨ Simplifying for you...
              </div>
            </div>
          ) : error ? (
            <div style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
              {error}
              {error.includes('refresh') || error.includes('invalidated') || error === EXTENSION_RELOAD_MESSAGE ? (
                <button
                  onClick={() => window.location.reload()}
                  style={{ display: 'block', margin: '12px auto 0', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#25D366', color: 'white', cursor: 'pointer' }}
                >
                  🔄 Page Refresh Karo
                </button>
              ) : (
                <button
                  onClick={() => generateExplanation(mode)}
                  style={{ display: 'block', margin: '12px auto 0', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#25D366', color: 'white', cursor: 'pointer' }}
                >
                  Try Again
                </button>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '15px', lineHeight: 1.7, color: '#1f2937', whiteSpace: 'pre-wrap' }}>
              {explanation}
            </div>
          )}
        </div>

        {/* Actions */}
        {!loading && !error && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCopy}
              style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
            >
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
            <button
              onClick={handleShare}
              style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: '#25D366', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
            >
              📤 Share
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
