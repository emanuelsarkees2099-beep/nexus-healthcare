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
        sora:  ['var(--font-sora)',  'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
        mono:  ['var(--font-mono)',  'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        bg:      '#020409',
        bg2:     '#080D1A',
        bg3:     '#0D1526',
        bg4:     '#141E35',
        accent:  '#6EE7B7',
        accent2: '#A7F3D0',
        amber:   '#FCD34D',
        coral:   '#F87171',
        violet:  '#A78BFA',
        'green-pulse': '#34D399',
      },
      keyframes: {
        blink:          { '0%,100%': { opacity: '1' },  '50%': { opacity: '0.2' } },
        'scroll-logos': { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        'cursor-blink': { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
        'skel-pulse':   { '0%,100%': { opacity: '0.4' }, '50%': { opacity: '0.9' } },
        'float-subtle': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        'open-pulse':   { '0%,100%': { boxShadow: '0 0 0 0 rgba(52,211,153,0.4)' }, '50%': { boxShadow: '0 0 0 4px rgba(52,211,153,0)' } },
      },
      animation: {
        blink:          'blink 2s ease-in-out infinite',
        'scroll-logos': 'scroll-logos 28s linear infinite',
        'cursor-blink': 'cursor-blink 1s step-end infinite',
        'skel-pulse':   'skel-pulse 1.5s ease-in-out infinite',
        'float-subtle': 'float-subtle 4s ease-in-out infinite',
        'open-pulse':   'open-pulse 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
