const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        sora: ['Sora', 'sans-serif'],
      },
      colors: {
        'catskill-white': {
          50: '#f1f3f8',
          100: '#e7eaf2',
          200: '#d4dae9',
          300: '#b6c2da',
          400: '#93a2c7',
          500: '#7987b8',
          600: '#6772a9',
          700: '#5b629a',
          800: '#4e537f',
          900: '#424666',
          950: '#2b2d40',
        },
        'bali-hai': {
          50: '#f5f6f8',
          100: '#ecf0f3',
          200: '#dce4e9',
          300: '#c6d1db',
          400: '#afbaca',
          500: '#99a6bb',
          600: '#8e98b0',
          700: '#707a92',
          800: '#5c6377',
          900: '#4e5561',
          950: '#2d3039',
        },
        orange: {
          50: '#fff3ed',
          100: '#ffe4d4',
          200: '#ffc5a8',
          300: '#ff9d71',
          400: '#ff5d29',
          500: '#fe4111',
          600: '#ef2707',
          700: '#c61808',
          800: '#9d160f',
          900: '#7e1510',
          950: '#440606',
        },
      },
    },
  },
  plugins: [],
};
