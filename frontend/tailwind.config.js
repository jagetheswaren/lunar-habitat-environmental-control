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
          950: '#030712',
          900: '#070d1d',
          850: '#0b1329',
          800: '#111c38',
          700: '#1c2a4f',
          600: '#2c3e6b',
        },
        lunar: {
          cyan: '#00f0ff',
          blue: '#0070f3',
          purple: '#7928ca',
          gold: '#f5a623',
          green: '#00df8f',
          red: '#ff0055',
          amber: '#ffaa00',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orbit-spin': 'spin 20s linear infinite',
      }
    },
  },
  plugins: [],
}
