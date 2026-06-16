import { useState, useEffect, useRef } from 'react';

export function WordExplainer() {
  const [word, setWord] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<{ meaning: string; pronunciation: string; hindiMeaning: string; simpleExplanation: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.split(/\s+/).length === 1 && text.length > 2 && text.length < 30) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(async () => {
          const target = e.target as HTMLElement;
          const isEditable = target.isContentEditable || ['INPUT', 'TEXTAREA'].includes(target.tagName);
          if (isEditable) return;

          setWord(text);
          setPosition({ x: e.clientX, y: e.clientY - 10 });
          setVisible(true);
          setLoading(true);
          setData(null);

          try {
            const context = target.textContent?.slice(0, 200) || '';
            const response = await chrome.runtime.sendMessage({
              type: 'EXPLAIN_WORD',
              payload: { word: text, context },
            });
            if (response.success) setData(response);
          } catch {
            // Silently fail for word explainer
          } finally {
            setLoading(false);
          }
        }, 800);
      } else {
        clearTimeout(timeoutRef.current);
      }
    };

    const handleMouseDown = () => {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => setVisible(false), 200);
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      onMouseEnter={() => clearTimeout(hideTimeoutRef.current)}
      onMouseLeave={() => { hideTimeoutRef.current = setTimeout(() => setVisible(false), 300); }}
      className="elw-glass"
      style={{
        position: 'fixed',
        left: Math.min(position.x, window.innerWidth - 280),
        top: position.y,
        transform: 'translateY(-100%)',
        zIndex: 2147483645,
        width: '260px',
        borderRadius: '12px',
        padding: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        fontFamily: 'Inter, system-ui, sans-serif',
        animation: 'fade-in 0.2s ease-out',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: '15px', color: '#16a34a', marginBottom: '4px' }}>
        📖 {word}
      </div>
      {loading ? (
        <div style={{ fontSize: '13px', color: '#9ca3af' }}>Looking up...</div>
      ) : data ? (
        <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
          <div style={{ color: '#374151', marginBottom: '4px' }}>{data.meaning}</div>
          {data.pronunciation && (
            <div style={{ color: '#6b7280', fontStyle: 'italic', fontSize: '12px' }}>/{data.pronunciation}/</div>
          )}
          {data.hindiMeaning && (
            <div style={{ color: '#16a34a', marginTop: '4px', fontSize: '12px' }}>🇮🇳 {data.hindiMeaning}</div>
          )}
          <div style={{ color: '#6b7280', marginTop: '6px', fontSize: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '6px' }}>
            {data.simpleExplanation}
          </div>
        </div>
      ) : null}
    </div>
  );
}
