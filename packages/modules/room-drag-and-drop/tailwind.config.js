module.exports = {
  purge: [
      './src/**/*.html',
      './src/**/*.vue'
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'prime-lighter': '#CCDCDA',
        'prime-lightest': '#E6EDED',
        'bcc-green': '#004E48',
        'bcc-green-90': 'rgba(0, 78, 72, 0.9)',
        'bcc-green-80': 'rgba(0, 78, 72, 0.8)',
        'bcc-green-70': 'rgba(0, 78, 72, 0.7)',
        'bcc-green-60': 'rgba(0, 78, 72, 0.6)',
        'bcc-green-50': 'rgba(0, 78, 72, 0.5)'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('tailwindcss-multi-column')(),
    require('tailwindcss-break')()
  ],
}