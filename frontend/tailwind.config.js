/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        military: {
          50: '#f4f6f0',
          100: '#e5e9d9',
          200: '#cbd4b2',
          300: '#a7b884',
          400: '#839b5a',
          500: '#647c3f',
          600: '#4d612e',
          700: '#3c4d25',
          800: '#323f20',
          900: '#2b361d',
          950: '#151c0d',
        }
      }
    },
  },
  plugins: [],
}
