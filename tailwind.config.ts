import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1E2A32',
        paper: '#FCFAF8',
        white: '#FCFAF8',
        stone: {
          DEFAULT: '#E9E4D8',
          dim: '#DCD5C4',
          light: '#F5F2EB',
        },
        brass: {
          DEFAULT: '#B08D45',
          hover: '#C29D52',
          light: '#D4AF37',
        },
        live: {
          DEFAULT: '#3E7C59',
          light: '#4E986F',
        },
        muted: '#7C7566',
      },
      fontFamily: {
        headline: ["'Fraunces'", 'Georgia', 'serif'],
        serif: ["'Fraunces'", 'Georgia', 'serif'],
        sans: ["'Plus Jakarta Sans'", 'system-ui', 'sans-serif'],
        mono: ["'JetBrains Mono'", 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
