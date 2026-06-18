/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#050505',
        frost: '#F0F4FF',
        electric: {
          DEFAULT: '#3B82F6',
          bright: '#60A5FA',
          glow: '#2563EB',
        },
        neon: {
          DEFAULT: '#A855F7',
          bright: '#C084FC',
          glow: '#7C3AED',
        },
        cyan: {
          soft: '#22D3EE',
          glow: '#06B6D4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"SF Pro Display"', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59,130,246,0.15), transparent)',
        'card-glow': 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(168,85,247,0.05) 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-md': '0 0 40px rgba(59, 130, 246, 0.4)',
        'glow-lg': '0 0 60px rgba(168, 85, 247, 0.3)',
        'glow-xl': '0 0 80px rgba(59, 130, 246, 0.2), 0 0 120px rgba(168, 85, 247, 0.1)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
};
