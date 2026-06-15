import { defineConfig } from 'wxt';
import { resolve } from 'node:path';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    resolve: {
      alias: {
        '@domain': resolve('src/domain'),
        '@application': resolve('src/application'),
        '@infrastructure': resolve('src/infrastructure'),
        '@ui': resolve('src/ui'),
      },
    },
  }),
  manifest: {
    name: 'WhatsApp CRM',
    description: 'CRM extension for WhatsApp Web — leads, reminders, AI auto-reply',
    permissions: ['storage', 'alarms', 'notifications', 'sidePanel'],
    host_permissions: ['https://web.whatsapp.com/*', 'http://localhost:11434/*'],
    action: {
      default_title: 'WhatsApp CRM',
      default_icon: {
        16: '/icon/16.png',
        48: '/icon/48.png',
        128: '/icon/128.png',
      },
    },
    icons: {
      16: '/icon/16.png',
      48: '/icon/48.png',
      128: '/icon/128.png',
    },
  },
});
