import { useState } from 'react';
import type { ExplanationMode } from '@/types';

export function PdfSimplifier() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);

  const extractPdfText = (): string => {
    const textLayers = document.querySelectorAll('.textLayer span, .textLayer div');
    let text = '';
    textLayers.forEach((el) => { text += el.textContent + ' '; });
    return text.trim();
  };

  const handleAction = async (action: 'summarize' | 'notes' | 'explain') => {
    setLoading(true);
    setError('');
    setResult('');
    setExpanded(true);

    const text = extractPdfText();
    if (!text || text.length < 20) {
      setError('Could not extract text from PDF. Try selecting text manually.');
      setLoading(false);
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SUMMARIZE_PDF',
        payload: { text, url: window.location.href, mode: 'exam-notes' as ExplanationMode, action },
      });
      if (response.success) {
        setResult(response.result);
      } else {
        setError(response.error || 'Failed to process PDF');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'markdown' | 'clipboard') => {
    if (format === 'clipboard') {
      navigator.clipboard.writeText(result);
    } else {
      const blob = new Blob([result], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'elw-notes.md';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 9999, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {!expanded ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {(['summarize', 'notes', 'explain'] as const).map((action) => (
            <button
              key={action}
              onClick={() => handleAction(action)}
              className="elw-gradient"
              style={{
                padding: '10px 16px', borderRadius: '12px', border: 'none', color: 'white',
                cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
              }}
            >
              📄 {action === 'summarize' ? 'Summarize PDF' : action === 'notes' ? 'Study Notes' : 'Explain PDF'}
            </button>
          ))}
        </div>
      ) : (
        <div className="elw-glass" style={{ width: '400px', maxHeight: '600px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div className="elw-gradient" style={{ padding: '12px 16px', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700 }}>📄 PDF Simplified</span>
            <button onClick={() => setExpanded(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}>×</button>
          </div>
          <div style={{ padding: '16px', maxHeight: '450px', overflowY: 'auto', fontSize: '14px', lineHeight: 1.6 }}>
            {loading && <div style={{ textAlign: 'center', color: '#9ca3af' }}>✨ Processing PDF...</div>}
            {error && <div style={{ color: '#ef4444' }}>{error}</div>}
            {result && <div style={{ whiteSpace: 'pre-wrap', color: '#1f2937' }}>{result}</div>}
          </div>
          {result && (
            <div style={{ padding: '8px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '8px' }}>
              <button onClick={() => handleExport('clipboard')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: '12px' }}>📋 Copy</button>
              <button onClick={() => handleExport('markdown')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#25D366', color: 'white', cursor: 'pointer', fontSize: '12px' }}>📥 Export MD</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
