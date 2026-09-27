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
          950: '#080B10',
          900: '#080B10',
          850: '#10151D',
          800: '#151B24',
          700: '#19212C',
          600: '#273142',
          border: '#273142',
          'border-active': '#38465C',
        },
        lunar: {
          void: '#080B10',
          bg: '#080B10',
          panel: '#10151D',
          secondary: '#151B24',
          elevated: '#19212C',
          card: '#151B24',
          border: '#273142',
          cyan: '#06B6D4',
          'cyan-bright': '#00E5FF',
          emerald: '#10B981',
          amber: '#F59E0B',
          red: '#EF4444',
          slate: '#64748B',
          muted: '#98A2B3',
          subtext: '#667085',
          text: '#F2F5F7',
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
