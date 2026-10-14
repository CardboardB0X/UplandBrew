/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          '"SF Mono"',
          'Menlo',
          'monospace',
        ],
      },
      colors: {
        upland: {
          canvas: '#F8FAFC',
          darkCanvas: '#09090B',
          emerald: {
            DEFAULT: '#10B981',
            deep: '#047857',
            glow: 'rgba(16, 185, 129, 0.35)',
          },
          amber: {
            DEFAULT: '#F59E0B',
            deep: '#B45309',
            glow: 'rgba(245, 158, 11, 0.35)',
          },
          rose: {
            DEFAULT: '#F43F5E',
            deep: '#BE123C',
            glow: 'rgba(244, 63, 94, 0.35)',
          },
          radar: {
            DEFAULT: '#0EA5E9',
            pulse: '#38BDF8',
            glow: 'rgba(14, 165, 233, 0.4)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
        xl: '24px',
        '2xl': '40px',
      },
      boxShadow: {
        'glass': '0 20px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'glass-dark': '0 20px 25px -5px rgba(0, 0, 0, 0.45), 0 8px 10px -6px rgba(0, 0, 0, 0.35)',
        'pill-emerald': '0 0 20px -2px rgba(16, 185, 129, 0.5)',
        'pill-amber': '0 0 20px -2px rgba(245, 158, 11, 0.5)',
        'pill-rose': '0 0 20px -2px rgba(244, 63, 94, 0.5)',
        'pill-radar': '0 0 22px -2px rgba(14, 165, 233, 0.6)',
      },
      keyframes: {
        radarSweep: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.18)', opacity: '0.35' },
        },
        floatSubtle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-3px)' },
        },
      },
      animation: {
        'radar-pulse': 'radarSweep 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-subtle': 'floatSubtle 3s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
