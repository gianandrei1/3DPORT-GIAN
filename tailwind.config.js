/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f0f0f',
        primary: '#FFFFFF',
        secondary: '#D9D9D9',
        accentUp: '#65A049',
        accentDown: '#A0494B',
        border: 'rgba(255, 255, 255, 0.1)',
        themeColor: 'var(--theme-color, #00ffff)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
