/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,tsx,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        hiremate: {
          bg: '#050508',
          'bg-elevated': '#0c0c12',
          card: '#12121a',
          'card-hover': '#1a1a26',
          primary: '#8B5CF6',
          secondary: '#C084FC',
          accent: '#F472B6',
          cyan: '#22D3EE',
          lime: '#A3E635',
          success: '#4ADE80',
          warning: '#FBBF24',
          danger: '#FB7185',
          text: '#FAFAFA',
          muted: '#A1A1AA',
          border: 'rgba(139, 92, 246, 0.25)',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Syne"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #8B5CF6 0%, #C084FC 40%, #F472B6 100%)',
        'gradient-aurora': 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 50%, #F472B6 100%)',
        'gradient-mesh': 'radial-gradient(at 40% 20%, rgba(139,92,246,0.35) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(244,114,182,0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(34,211,238,0.15) 0px, transparent 50%)',
        'gradient-card': 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(18,18,26,0.95) 50%, rgba(244,114,182,0.06) 100%)',
        'gradient-glow': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139,92,246,0.3), transparent)',
        'gradient-border': 'linear-gradient(135deg, rgba(139,92,246,0.6), rgba(244,114,182,0.4), rgba(34,211,238,0.3))',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        glow: '0 0 30px rgba(139, 92, 246, 0.35)',
        'glow-pink': '0 0 30px rgba(244, 114, 182, 0.3)',
        'glow-cyan': '0 0 30px rgba(34, 211, 238, 0.25)',
        'glow-lg': '0 0 60px rgba(139, 92, 246, 0.4)',
        card: '0 4px 24px rgba(0, 0, 0, 0.5)',
        float: '0 24px 80px rgba(0, 0, 0, 0.6)',
        neon: '0 0 20px rgba(139,92,246,0.5), 0 0 40px rgba(244,114,182,0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        glow: 'glow 3s ease-in-out infinite alternate',
        aurora: 'aurora 12s ease-in-out infinite',
        'gradient-x': 'gradient-x 6s ease infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(1deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { opacity: '0.5', transform: 'scale(1)' },
          '100%': { opacity: '1', transform: 'scale(1.05)' },
        },
        aurora: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 15px) scale(0.95)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
