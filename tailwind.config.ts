import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sora: ['var(--font-sora)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        bg: '#030712',
        bg2: '#060E1E',
        bg3: '#0A1628',
        bg4: '#0F1E35',
        accent: '#5a8a90',
        accent2: '#5a8a90',
      },
      keyframes: {
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.2' },
        },
        'scroll-logos': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'cursor-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        'blink': 'blink 2s ease-in-out infinite',
        'scroll-logos': 'scroll-logos 28s linear infinite',
        'cursor-blink': 'cursor-blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
}

export default config
