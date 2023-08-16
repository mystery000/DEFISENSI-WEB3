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
        catskill: {
          50: '#f1f3f8',
          100: '#e7eaf2',
          200: '#d4dae9',
        },
      },
    },
  },
  plugins: [],
};
