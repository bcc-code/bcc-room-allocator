module.exports = {
  purge: [
      './src/**/*.html',
      './src/**/*.vue'
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('tailwindcss-multi-column')(),
    require('tailwindcss-break')()
  ],
}