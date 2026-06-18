import { useState, useEffect, useCallback, useRef } from 'react';
import { ExplainPopup } from './explain-popup';
import { WordExplainer } from './word-explainer';
import { FocusMode } from './focus-mode';
import type { ExplanationMode } from '@/types';
import { getSettings } from '@/services/storage/indexed-db';

const MIN_SELECTION_LENGTH = 15;

function getSurroundingText(): string {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return '';

  let node: Node | null = selection.anchorNode;
  while (node && node.nodeType !== Node.ELEMENT_NODE) {
    node = node.parentNode;
  }

  if (node instanceof HTMLElement) {
    const block = node.closest('p, li, td, th, h1, h2, h3, h4, article, section, div');
    if (block?.textContent) {
      return block.textContent.replace(/\s+/g, ' ').trim().slice(0, 600);
    }
  }

  return document.title;
}

export function HighlightExplainer() {
  const [selectedText, setSelectedText] = useState('');
  const [surroundingText, setSurroundingText] = useState('');
  const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });
  const [showButton, setShowButton] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [defaultMode, setDefaultMode] = useState<ExplanationMode>('whatsapp');
  const [wordExplainerEnabled, setWordExplainerEnabled] = useState(true);
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const selectionTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    getSettings().then((s) => {
      setDefaultMode(s.defaultMode);
      setWordExplainerEnabled(s.wordExplainerEnabled);
    });
  }, []);

  const handleSelection = useCallback(() => {
    clearTimeout(selectionTimeout.current);
    selectionTimeout.current = setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length >= MIN_SELECTION_LENGTH && text.length < 5000) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();
        if (rect) {
          setSelectedText(text);
          setSurroundingText(getSurroundingText());
          setButtonPos({
            x: rect.left + rect.width / 2,
            y: rect.top - 50 + window.scrollY,
          });
          setShowButton(true);
          return;
        }
      }
      setShowButton(false);
    }, 300);
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);
    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
    };
  }, [handleSelection]);

  useEffect(() => {
    const listener = (message: { type: string; payload?: { text?: string } }) => {
      if (message.type === 'TRIGGER_EXPLAIN' && message.payload?.text) {
        setSelectedText(message.payload.text);
        setShowPopup(true);
        setShowButton(false);
      }
      if (message.type === 'TRIGGER_EXPLAIN_SHORTCUT') {
        const text = window.getSelection()?.toString().trim();
        if (text && text.length >= MIN_SELECTION_LENGTH) {
          setSelectedText(text);
          setSurroundingText(getSurroundingText());
          setShowPopup(true);
          setShowButton(false);
        }
      }
      if (message.type === 'TOGGLE_FOCUS_MODE') {
        setFocusModeActive((prev) => !prev);
      }
      if (message.type === 'SHOW_EXPLAIN_HINT') {
        setShowHint(true);
        setTimeout(() => setShowHint(false), 5000);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const handleExplainClick = () => {
    setShowPopup(true);
    setShowButton(false);
  };

  return (
    <>
      {showHint && (
        <div
          style={{
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 2147483647, background: '#25D366', color: 'white', padding: '12px 24px',
            borderRadius: '12px', fontSize: '14px', fontWeight: 600, fontFamily: 'system-ui,sans-serif',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }}
        >
          ✅ Ab koi bhi text select karo — 💬 Explain button dikhega!
        </div>
      )}
      {showButton && (
        <button
          onClick={handleExplainClick}
          className="elw-glass elw-gradient"
          style={{
            position: 'absolute',
            left: buttonPos.x,
            top: buttonPos.y,
            transform: 'translateX(-50%)',
            zIndex: 2147483646,
            padding: '8px 16px',
            borderRadius: '24px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: '0 4px 20px rgba(37, 211, 102, 0.5)',
            animation: 'float 3s ease-in-out infinite',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <span style={{ fontSize: '18px' }}>💬</span>
          Explain
        </button>
      )}

      {showPopup && (
        <ExplainPopup
          text={selectedText}
          surroundingText={surroundingText}
          defaultMode={defaultMode}
          onClose={() => setShowPopup(false)}
        />
      )}

      {wordExplainerEnabled && <WordExplainer />}

      {focusModeActive && <FocusMode onClose={() => setFocusModeActive(false)} />}
    </>
  );
}
