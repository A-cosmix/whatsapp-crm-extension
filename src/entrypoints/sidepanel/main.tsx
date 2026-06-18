import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@momentum/components/ThemeProvider';
import { SidebarApp } from './App';
import '@momentum/styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <SidebarApp />
  </ThemeProvider>,
);
