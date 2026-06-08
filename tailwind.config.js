/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          50:  '#FDF5F0',
          100: '#F9E4D8',
          200: '#F2C5A8',
          300: '#E8A07A',
          400: '#DCAE96',
          500: '#C98B6E',
          600: '#A96A4E',
          700: '#7D4A33',
        },
        text: {
          dark: '#3D2B1F',
          mid:  '#7A5547',
          light: '#B08070',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['Lato', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
