const TRACK_INTERVAL = 30;
let trackTimer: ReturnType<typeof setInterval> | null = null;
let pageStartTime = Date.now();
let floatingRoot: HTMLDivElement | null = null;

function getPageContent(): { title: string; content: string } {
  const title = document.title;
  const article = document.querySelector('article')?.innerText;
  const main = document.querySelector('main')?.innerText;
  const body = document.body?.innerText ?? '';
  const content = (article || main || body).slice(0, 12000);
  return { title, content };
}

function getYouTubeData(): { title: string; description: string } {
  const title = document.querySelector('h1.ytd-video-primary-info-renderer, h1.title')?.textContent?.trim()
    ?? document.title.replace(' - YouTube', '');
  const description = document.querySelector('#description-inline-expander, #description')?.textContent?.trim() ?? '';
  return { title, description };
}

function isYouTube(): boolean {
  return location.hostname.includes('youtube.com') && location.pathname === '/watch';
}

function trackTime(): void {
  const domain = location.hostname;
  chrome.runtime.sendMessage({
    type: 'MX_TRACK_ANALYTICS',
    payload: { domain, duration: TRACK_INTERVAL },
  }).catch(() => {});
}

function createFloatingAssistant(): void {
  if (floatingRoot) return;

  floatingRoot = document.createElement('div');
  floatingRoot.id = 'momentum-x-float';
  floatingRoot.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 2147483646;
    font-family: Inter, system-ui, sans-serif;
  `;

  const btn = document.createElement('button');
  btn.style.cssText = `
    width: 52px; height: 52px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);
    background: linear-gradient(135deg, #3b82f6, #7c3aed); color: white; cursor: pointer;
    box-shadow: 0 0 30px rgba(59,130,246,0.4); display: flex; align-items: center; justify-content: center;
    transition: transform 0.2s, box-shadow 0.2s; backdrop-filter: blur(20px);
  `;
  btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`;
  btn.title = 'Momentum X AI';

  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'scale(1.08)';
    btn.style.boxShadow = '0 0 50px rgba(59,130,246,0.6)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = '0 0 30px rgba(59,130,246,0.4)';
  });

  btn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'MX_OPEN_SIDEPANEL' });
  });

  floatingRoot.appendChild(btn);
  document.body.appendChild(floatingRoot);
}

function showAIResult(title: string, content: string): void {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 2147483647; background: rgba(0,0,0,0.6);
    backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center;
    font-family: Inter, system-ui, sans-serif; padding: 24px;
  `;

  const panel = document.createElement('div');
  panel.style.cssText = `
    max-width: 560px; width: 100%; max-height: 80vh; overflow-y: auto;
    background: #0a0a0a; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px;
    padding: 24px; color: #f0f4ff; box-shadow: 0 0 60px rgba(59,130,246,0.2);
  `;

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h3 style="margin:0;font-size:16px;text-transform:capitalize;color:#60a5fa">${title}</h3>
      <button id="mx-close" style="background:none;border:none;color:#fff;opacity:0.5;cursor:pointer;font-size:20px">&times;</button>
    </div>
    <div style="font-size:14px;line-height:1.7;opacity:0.85;white-space:pre-wrap">${content}</div>
    <button id="mx-copy" style="margin-top:16px;padding:10px 20px;border-radius:12px;border:none;
      background:linear-gradient(135deg,#3b82f6,#7c3aed);color:#fff;cursor:pointer;font-size:13px;width:100%">
      Copy to Clipboard
    </button>
  `;

  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  panel.querySelector('#mx-close')?.addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  panel.querySelector('#mx-copy')?.addEventListener('click', () => {
    navigator.clipboard.writeText(content);
  });
}

function showQuickNote(): void {
  const note = prompt('Quick Note — Momentum X:');
  if (note?.trim()) {
    chrome.runtime.sendMessage({
      type: 'MX_ADD_NOTE',
      payload: { title: 'Quick Note', content: note.trim() },
    });
  }
}

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',

  main() {
    pageStartTime = Date.now();
    trackTimer = setInterval(trackTime, TRACK_INTERVAL * 1000);

    chrome.storage.sync.get('mx_settings', (result) => {
      const settings = result.mx_settings as { floatingAssistant?: boolean } | undefined;
      if (settings?.floatingAssistant !== false) {
        createFloatingAssistant();
      }
    });

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      switch (message.type) {
        case 'MX_GET_PAGE_CONTENT':
          sendResponse(getPageContent());
          return true;

        case 'MX_GET_YOUTUBE_DATA':
          sendResponse(isYouTube() ? getYouTubeData() : { title: document.title, description: '' });
          return true;

        case 'MX_TRIGGER_PAGE_SUMMARY':
          chrome.runtime.sendMessage({ type: 'MX_OPEN_SIDEPANEL' });
          break;

        case 'MX_SHOW_AI_RESULT': {
          const { title, content } = message.payload as { title: string; content: string };
          showAIResult(title, content);
          break;
        }

        case 'MX_QUICK_NOTE':
          showQuickNote();
          break;
      }
      return false;
    });

    window.addEventListener('beforeunload', () => {
      if (trackTimer) clearInterval(trackTimer);
      const elapsed = Math.floor((Date.now() - pageStartTime) / 1000);
      if (elapsed > 5) {
        chrome.runtime.sendMessage({
          type: 'MX_TRACK_ANALYTICS',
          payload: { domain: location.hostname, duration: elapsed },
        }).catch(() => {});
      }
    });
  },
});
