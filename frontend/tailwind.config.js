/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Magical Source Demo"', 'serif'],
        geist: ['Geist', 'sans-serif'],
        display: ['Anton', 'sans-serif'],
        sans: ['Geist', 'Inter', 'sans-serif'],
        editorial: ['Syne', 'sans-serif'],
      },
      transitionTimingFunction: {
        'cinematic': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '650': '650ms',
      },
      letterSpacing: {
        'widest-editorial': '0.35em',
        'super-wide': '0.45em',
      },
    },
  },
  plugins: [],
}
