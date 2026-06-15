/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,tsx,ts}'],
  theme: {
    extend: {
      colors: {
        wa: {
          green: '#25D366',
          dark: '#075E54',
          light: '#DCF8C6',
          panel: '#111B21',
          surface: '#202C33',
          border: '#2A3942',
          text: '#E9EDEF',
          muted: '#8696A0',
        },
      },
    },
  },
  plugins: [],
};
