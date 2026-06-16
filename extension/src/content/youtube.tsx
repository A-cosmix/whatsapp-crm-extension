import { createRoot } from 'react-dom/client';
import { YouTubeSimplifier } from './youtube-simplifier';

function init() {
  if (document.getElementById('elw-youtube-root')) return;

  const container = document.createElement('div');
  container.id = 'elw-youtube-root';
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<YouTubeSimplifier />);
}

const observer = new MutationObserver(() => {
  if (window.location.pathname.includes('/watch')) init();
});

observer.observe(document.body, { childList: true, subtree: true });
init();

export {};
