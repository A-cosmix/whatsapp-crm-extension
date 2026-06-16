/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,tsx,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        priority: {
          important: '#ef4444',
          routine: '#3b82f6',
          low: '#9ca3af',
        },
        sentiment: {
          positive: '#22c55e',
          neutral: '#eab308',
          urgent: '#ef4444',
          frustrated: '#f97316',
        },
      },
      animation: {
        spin: 'spin 1s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
