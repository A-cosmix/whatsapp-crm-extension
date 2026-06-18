import { useState, useEffect, useCallback, useRef } from 'react';
import { ExplainPopup } from './explain-popup';
import { WordExplainer } from './word-explainer';
import { FocusMode } from './focus-mode';
import type { ExplanationMode } from '@/types';
import { getSettings } from '@/services/storage/indexed-db';
import { isValidExplainSelection, isExtensionContextValid, pingExtension } from '@/utils/helpers';

function RefreshBanner({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 2147483647, background: '#dc2626', color: 'white', padding: '14px 20px',
        borderRadius: '12px', fontSize: '14px', fontWeight: 600, fontFamily: 'system-ui,sans-serif',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)', textAlign: 'center', maxWidth: '90vw',
      }}
    >
      <div>⚠️ Extension reload ho gayi — pehle page refresh karo!</div>
      <button
        onClick={onRefresh}
        style={{
          marginTop: '10px', padding: '8px 16px', borderRadius: '8px', border: 'none',
          background: 'white', color: '#dc2626', cursor: 'pointer', fontWeight: 700,
        }}
      >
        🔄 Abhi Refresh Karo (F5)
      </button>
    </div>
  );
}

export function HighlightExplainer() {
  const [selectedText, setSelectedText] = useState('');
  const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });
  const [showButton, setShowButton] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [defaultMode, setDefaultMode] = useState<ExplanationMode>('whatsapp');
  const [wordExplainerEnabled, setWordExplainerEnabled] = useState(true);
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showRefreshBanner, setShowRefreshBanner] = useState(false);
  const selectionTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!isExtensionContextValid()) {
      setShowRefreshBanner(true);
    }
  }, []);

  const openExplainPopup = async (text: string) => {
    if (!isExtensionContextValid() || !(await pingExtension())) {
      setShowRefreshBanner(true);
      setShowButton(false);
      return;
    }
    setSelectedText(text);
    setShowPopup(true);
    setShowButton(false);
  };

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

      if (text && isValidExplainSelection(text)) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();
        if (rect) {
          setSelectedText(text);
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
        const text = message.payload.text.trim();
        if (isValidExplainSelection(text)) {
          void openExplainPopup(text);
        }
      }
      if (message.type === 'TRIGGER_EXPLAIN_SHORTCUT') {
        const text = window.getSelection()?.toString().trim();
        if (text && isValidExplainSelection(text)) {
          void openExplainPopup(text);
        }
      }
      if (message.type === 'EXTENSION_UPDATED') {
        setShowRefreshBanner(true);
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
    void openExplainPopup(selectedText);
  };

  return (
    <>
      {showRefreshBanner && (
        <RefreshBanner onRefresh={() => window.location.reload()} />
      )}
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
          defaultMode={defaultMode}
          onClose={() => setShowPopup(false)}
        />
      )}

      {wordExplainerEnabled && <WordExplainer />}

      {focusModeActive && <FocusMode onClose={() => setFocusModeActive(false)} />}
    </>
  );
}
