/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.html',
    './dist/**/*.html',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        spxp: {
          dark: '#0a0a0f',
          darker: '#050508',
          accent: '#6366f1',
          green: '#22c55e',
          muted: '#6b7280'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    }
  },
  plugins: [],
}
