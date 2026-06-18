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
    name: 'HireMate AI',
    short_name: 'HireMate',
    description: 'Land Jobs Faster. Apply Smarter. — AI resume optimizer, ATS analyzer, job matcher & career copilot.',
    version: '1.0.0',
    permissions: ['storage', 'alarms', 'notifications', 'tabs', 'activeTab', 'scripting'],
    host_permissions: [
      'https://www.linkedin.com/*',
      'https://www.indeed.com/*',
      'https://www.naukri.com/*',
      'https://www.glassdoor.com/*',
      'https://api.openai.com/*',
      'https://api.stripe.com/*',
      'https://api.razorpay.com/*',
    ],
    action: {
      default_title: 'HireMate AI',
      default_popup: 'popup.html',
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
    options_ui: {
      page: 'options.html',
      open_in_tab: true,
    },
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'",
    },
  },
});
