import { getAdapterForUrl } from '@infrastructure/job-boards/adapters';
import { generateId } from '@domain/value-objects';

export default defineContentScript({
  matches: [
    'https://www.linkedin.com/jobs/*',
    'https://www.linkedin.com/job/*',
    'https://www.indeed.com/*',
    'https://www.naukri.com/*',
    'https://www.glassdoor.com/*',
    'https://www.glassdoor.co.in/*',
  ],
  cssInjectionMode: 'ui',

  async main(ctx) {
    const url = window.location.href;
    const adapter = getAdapterForUrl(url);
    if (!adapter) return;

    await new Promise((r) => setTimeout(r, 2000));

    const job = await adapter.extractJobDescription();
    if (!job) return;

    chrome.runtime.sendMessage({
      type: 'JOB_DETECTED',
      payload: { ...job, id: generateId(), scrapedAt: new Date().toISOString() },
    });

    const ui = await createShadowRootUi(ctx, {
      name: 'hiremate-job-panel',
      position: 'inline',
      anchor: 'body',
      append: 'last',
      onMount(container) {
        container.innerHTML = '';
        const panel = document.createElement('div');
        panel.id = 'hiremate-floating-panel';
        panel.innerHTML = `
          <style>
            #hiremate-floating-panel {
              position: fixed;
              bottom: 24px;
              right: 24px;
              z-index: 99999;
              font-family: Inter, system-ui, sans-serif;
              animation: hm-slide-in 0.4s ease-out;
            }
            @keyframes hm-slide-in {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            .hm-card {
              background: rgba(17, 24, 39, 0.95);
              backdrop-filter: blur(20px);
              border: 1px solid rgba(124, 58, 237, 0.3);
              border-radius: 16px;
              padding: 16px 20px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(124,58,237,0.2);
              max-width: 320px;
              color: #fff;
            }
            .hm-header {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 8px;
            }
            .hm-logo {
              width: 28px;
              height: 28px;
              border-radius: 8px;
              background: linear-gradient(135deg, #7C3AED, #A855F7);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
            }
            .hm-title { font-weight: 700; font-size: 14px; background: linear-gradient(135deg, #7C3AED, #A855F7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .hm-job { font-size: 12px; color: #94A3B8; margin-bottom: 12px; }
            .hm-btn {
              width: 100%;
              padding: 10px;
              border: none;
              border-radius: 10px;
              background: linear-gradient(135deg, #7C3AED, #A855F7);
              color: white;
              font-weight: 600;
              font-size: 13px;
              cursor: pointer;
              transition: transform 0.2s, box-shadow 0.2s;
            }
            .hm-btn:hover { transform: scale(1.02); box-shadow: 0 0 20px rgba(124,58,237,0.4); }
            .hm-close {
              position: absolute;
              top: 8px;
              right: 8px;
              background: none;
              border: none;
              color: #94A3B8;
              cursor: pointer;
              font-size: 16px;
              line-height: 1;
            }
          </style>
          <div class="hm-card" style="position:relative">
            <button class="hm-close" id="hm-close">×</button>
            <div class="hm-header">
              <div class="hm-logo">✨</div>
              <span class="hm-title">HireMate AI</span>
            </div>
            <p class="hm-job">${job.title} at ${job.company}</p>
            <button class="hm-btn" id="hm-analyze">Analyze Job Match</button>
          </div>
        `;
        container.appendChild(panel);

        panel.querySelector('#hm-close')?.addEventListener('click', () => {
          panel.style.display = 'none';
        });

        panel.querySelector('#hm-analyze')?.addEventListener('click', () => {
          chrome.runtime.sendMessage({
            type: 'MATCH_JOB',
            payload: {
              jobTitle: job.title,
              company: job.company,
              location: job.location,
              jobDescription: job.description,
              url: job.url,
            },
          });
          chrome.runtime.openOptionsPage();
        });
      },
    });

    ui.mount();
  },
});
