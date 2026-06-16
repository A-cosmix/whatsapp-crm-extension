import { defineConfig } from 'wxt';
import { resolve } from 'node:path';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    resolve: {
      alias: {
        '@momentum': resolve('src/momentum'),
      },
    },
  }),
  manifest: {
    name: 'Momentum X',
    short_name: 'Momentum X',
    description: 'The world\'s smartest productivity extension powered by AI. Reimagine your browser.',
    version: '1.0.0',
    permissions: [
      'storage',
      'alarms',
      'notifications',
      'sidePanel',
      'tabs',
      'contextMenus',
      'activeTab',
      'scripting',
    ],
    host_permissions: ['<all_urls>'],
    action: {
      default_title: 'Momentum X',
      default_popup: 'popup.html',
    },
    side_panel: {
      default_path: 'sidepanel.html',
    },
    chrome_url_overrides: {
      newtab: 'newtab.html',
    },
    options_ui: {
      page: 'options.html',
      open_in_tab: true,
    },
    commands: {
      'open-sidebar': {
        suggested_key: { default: 'Alt+Shift+M', mac: 'Alt+Shift+M' },
        description: 'Open Momentum X AI sidebar',
      },
      'summarize-page': {
        suggested_key: { default: 'Alt+Shift+S', mac: 'Alt+Shift+S' },
        description: 'Summarize current page',
      },
      'quick-note': {
        suggested_key: { default: 'Alt+Shift+N', mac: 'Alt+Shift+N' },
        description: 'Create a quick note',
      },
      'toggle-timer': {
        suggested_key: { default: 'Alt+Shift+T', mac: 'Alt+Shift+T' },
        description: 'Toggle focus timer',
      },
    },
    icons: {
      16: 'icon/16.png',
      48: 'icon/48.png',
      128: 'icon/128.png',
    },
  },
});
