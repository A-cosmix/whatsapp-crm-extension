/**
 * In-page guided tour for Gmail and Outlook (shown once after popup onboarding).
 */

import { completeEmailTour, getOnboardingState, shouldShowEmailTour } from '@/utils/onboarding';

interface TourStep {
  target: 'right' | 'left' | 'center';
  title: string;
  body: string;
  position: Record<string, string>;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: 'right',
    title: 'AI Analysis Panel',
    body: 'When you open an email, a summary panel appears here with priority, sentiment, and smart replies.',
    position: { top: '120px', right: '360px' },
  },
  {
    target: 'left',
    title: 'Priority Filters',
    body: 'Use this sidebar to filter your inbox by Important, Routine, or Low Priority emails.',
    position: { top: '120px', left: '210px' },
  },
  {
    target: 'center',
    title: 'Keyboard Shortcut',
    body: 'Press Alt+S anytime to analyze the open email.',
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  },
];

let tourHost: HTMLElement | null = null;
let tourStep = 0;

export async function maybeStartEmailTour(shortcutLabel: string): Promise<void> {
  const state = await getOnboardingState();
  if (!shouldShowEmailTour(state)) return;

  TOUR_STEPS[2].body = `Press ${shortcutLabel} anytime to analyze the open email.`;
  setTimeout(() => startTour(), 2000);
}

function startTour(): void {
  if (tourHost) return;
  tourStep = 0;
  renderTourStep();
}

function renderTourStep(): void {
  cleanupTour();

  const step = TOUR_STEPS[tourStep];
  if (!step) return;

  tourHost = document.createElement('div');
  tourHost.id = 'aes-tour-host';
  tourHost.setAttribute('role', 'dialog');
  tourHost.setAttribute('aria-label', 'Onboarding tour');

  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,0.45)';
  overlay.addEventListener('click', dismissTour);

  const card = document.createElement('div');
  const pos = step.position;
  card.style.cssText = `
    position: fixed; z-index: 100001; width: 300px; padding: 16px;
    border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.25);
    background: ${dark ? '#1e1e2e' : '#ffffff'};
    color: ${dark ? '#e2e8f0' : '#1e293b'};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px; line-height: 1.5;
    top: ${pos.top ?? 'auto'}; right: ${pos.right ?? 'auto'};
    left: ${pos.left ?? 'auto'}; transform: ${pos.transform ?? 'none'};
  `;

  const isLast = tourStep === TOUR_STEPS.length - 1;

  card.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <span style="font-size:11px;color:#64748b">Tour · ${tourStep + 1}/${TOUR_STEPS.length}</span>
      <button id="aes-tour-close" style="background:none;border:none;cursor:pointer;font-size:16px;color:#94a3b8" aria-label="Close tour">×</button>
    </div>
    <h3 style="font-size:15px;font-weight:600;margin-bottom:6px">${step.title}</h3>
    <p style="font-size:13px;color:${dark ? '#94a3b8' : '#64748b'};margin-bottom:14px">${step.body}</p>
    <div style="display:flex;gap:6px;justify-content:flex-end">
      <button id="aes-tour-skip" style="padding:6px 12px;font-size:12px;border:none;background:none;cursor:pointer;color:#94a3b8">Skip</button>
      <button id="aes-tour-next" style="padding:6px 14px;font-size:12px;border:none;border-radius:6px;background:#3b82f6;color:#fff;cursor:pointer;font-weight:500">
        ${isLast ? 'Got it!' : 'Next →'}
      </button>
    </div>
  `;

  if (step.target === 'right') {
    const highlight = document.createElement('div');
    highlight.style.cssText = `
      position:fixed;top:70px;right:16px;width:360px;height:400px;
      border:2px solid #3b82f6;border-radius:12px;z-index:100000;
      pointer-events:none;box-shadow:0 0 0 4px rgba(59,130,246,0.2);
    `;
    tourHost.appendChild(highlight);
  } else if (step.target === 'left') {
    const highlight = document.createElement('div');
    highlight.style.cssText = `
      position:fixed;top:70px;left:0;width:200px;height:300px;
      border:2px solid #3b82f6;border-radius:0 8px 8px 0;z-index:100000;
      pointer-events:none;box-shadow:0 0 0 4px rgba(59,130,246,0.2);
    `;
    tourHost.appendChild(highlight);
  }

  tourHost.appendChild(overlay);
  tourHost.appendChild(card);
  document.body.appendChild(tourHost);

  card.querySelector('#aes-tour-close')?.addEventListener('click', dismissTour);
  card.querySelector('#aes-tour-skip')?.addEventListener('click', dismissTour);
  card.querySelector('#aes-tour-next')?.addEventListener('click', () => {
    if (isLast) dismissTour();
    else {
      tourStep++;
      renderTourStep();
    }
  });
}

function cleanupTour(): void {
  tourHost?.remove();
  tourHost = null;
}

async function dismissTour(): Promise<void> {
  cleanupTour();
  await completeEmailTour();
}

export async function restartEmailTour(shortcutLabel: string): Promise<void> {
  const state = await getOnboardingState();
  await chrome.storage.local.set({
    onboardingState: { ...state, emailTourCompleted: false },
  });
  TOUR_STEPS[2].body = `Press ${shortcutLabel} anytime to analyze the open email.`;
  startTour();
}
