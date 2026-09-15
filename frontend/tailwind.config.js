/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Anton', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
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
      colors: {
        stone: {
          limestone: '#D8D2C6',
          sand: '#E3DDD3',
          concrete: '#C7CCD1',
          slate: '#363E48',
          charcoal: '#1A1C1E',
          terracotta: '#C87D65',
          olive: '#5A6255',
          ivory: '#F4F1EA',
        }
      }
    },
  },
  plugins: [],
}
