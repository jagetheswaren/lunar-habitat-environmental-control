/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          950: '#070A0F',
          900: '#0B0E14',
          850: '#111622',
          800: '#161D2B',
          700: '#1C2436',
          600: '#253147',
          border: '#1E2638',
          'border-active': '#2B374E',
        },
        lunar: {
          void: '#070A0F',
          bg: '#0B0E14',
          panel: '#111622',
          card: '#161D2B',
          border: '#1E2638',
          cyan: '#06B6D4',
          'cyan-bright': '#00E5FF',
          emerald: '#10B981',
          amber: '#F59E0B',
          red: '#EF4444',
          slate: '#64748B',
          muted: '#8C9BAE',
          text: '#F0F4F8',
        }
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', '"JetBrains Mono"', 'monospace'],
        sans: ['"IBM Plex Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orbit-spin': 'spin 20s linear infinite',
      }
    },
  },
  plugins: [],
}
