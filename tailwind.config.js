/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,tsx,ts}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B141A',
          panel: '#111B21',
          surface: '#1F2C34',
          hover: '#2A3942',
          border: '#2A3942',
          borderLight: '#374955',
          input: '#0B141A',
        },
        wa: {
          green: '#00A884',
          greenLight: '#25D366',
          greenDark: '#008069',
          teal: '#075E54',
          text: '#E9EDEF',
          muted: '#8696A0',
          danger: '#F15C6D',
          warning: '#FFB347',
        },
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.35)',
        glow: '0 0 12px rgba(0, 168, 132, 0.25)',
      },
    },
  },
  plugins: [],
};
