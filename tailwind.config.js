/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,tsx,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        hiremate: {
          bg: '#09090B',
          card: '#111827',
          primary: '#7C3AED',
          secondary: '#A855F7',
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
          text: '#FFFFFF',
          muted: '#94A3B8',
          border: 'rgba(124, 58, 237, 0.2)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #C084FC 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(17, 24, 39, 0.8) 100%)',
        'gradient-glow': 'radial-gradient(ellipse at top, rgba(124, 58, 237, 0.15) 0%, transparent 60%)',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.37)',
        glow: '0 0 20px rgba(124, 58, 237, 0.3)',
        'glow-lg': '0 0 40px rgba(124, 58, 237, 0.4)',
        card: '0 4px 24px rgba(0, 0, 0, 0.4)',
        float: '0 20px 60px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.2)' },
          '100%': { boxShadow: '0 0 40px rgba(124, 58, 237, 0.5)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
