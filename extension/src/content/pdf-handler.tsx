import { createRoot } from 'react-dom/client';
import { PdfSimplifier } from './pdf-simplifier';

function init() {
  if (document.getElementById('elw-pdf-root')) return;

  const container = document.createElement('div');
  container.id = 'elw-pdf-root';
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<PdfSimplifier />);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export {};
