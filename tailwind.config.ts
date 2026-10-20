import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        black: '#070708',
        charcoal: {
          DEFAULT: '#121214',
          subtle: '#1B1B1F',
          border: '#29292F',
        },
        offwhite: {
          DEFAULT: '#F4F1EA',
          muted: '#C8C4BA',
          dim: '#8E8B83',
        },
        amber: {
          DEFAULT: '#F59E0B',
          glow: 'rgba(245, 158, 11, 0.22)',
          dark: '#B45309',
        },
        safelight: {
          DEFAULT: '#B3261E',
          glow: 'rgba(179, 38, 30, 0.35)',
          deep: '#4A0D0A',
        },
      },
      fontFamily: {
        title: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
      },
      animation: {
        'shutter-blink': 'shutterBlink 150ms ease-in-out',
        'pulse-amber': 'pulseAmber 2.5s infinite',
        'safelight-breath': 'safelightBreath 4s ease-in-out infinite',
      },
      keyframes: {
        shutterBlink: {
          '0%': { opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        pulseAmber: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.02)' },
        },
        safelightBreath: {
          '0%, 100%': { filter: 'drop-shadow(0 0 15px rgba(179,38,30,0.3))' },
          '50%': { filter: 'drop-shadow(0 0 30px rgba(179,38,30,0.65))' },
        },
      },
    },
  },
  plugins: [],
};

export default config;