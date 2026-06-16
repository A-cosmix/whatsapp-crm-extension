import { createRoot } from 'react-dom/client';
import { HighlightExplainer } from './highlight-button';

function init() {
  if (document.getElementById('elw-root')) return;

  const container = document.createElement('div');
  container.id = 'elw-root';
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<HighlightExplainer />);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export {};
