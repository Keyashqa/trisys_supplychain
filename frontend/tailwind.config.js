/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ts: {
          blue:     '#0C8DC3',
          'blue-d': '#0a7aab',
          green:    '#ABCF45',
          'green-d':'#5a8a00',
          navy:     '#052762',
          muted:    '#3a6070',
          border:   '#C8DDE3',
          bg:       '#FEFEFD',
          surface:  '#FFFFFF',
          panel:    '#EEF6FA',
        },
      },
    },
  },
  plugins: [],
}
