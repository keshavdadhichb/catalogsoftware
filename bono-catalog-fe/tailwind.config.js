/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neo-bg':        '#FFFDF5', // cream canvas
        'neo-ink':       '#000000', // pure black
        'neo-accent':    '#FF6B6B', // hot red
        'neo-secondary': '#FFD93D', // vivid yellow
        'neo-muted':     '#C4B5FD', // soft violet
      },
      boxShadow: {
        'neo-sm':  '4px 4px 0px 0px #000',
        'neo':     '8px 8px 0px 0px #000',
        'neo-lg':  '12px 12px 0px 0px #000',
        'neo-xl':  '16px 16px 0px 0px #000',
        'neo-inv': '8px 8px 0px 0px #fff', // for use on black sections
      },
      keyframes: {
        'spin-slow':   { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
        'marquee':     { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        'wiggle':      { '0%,100%': { transform: 'rotate(-3deg)' }, '50%': { transform: 'rotate(3deg)' } },
      },
      animation: {
        'spin-slow': 'spin-slow 10s linear infinite',
        'marquee':   'marquee 20s linear infinite',
        'wiggle':    'wiggle 1s ease-in-out infinite',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
