/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./presets/**/*.{js,vue,ts}",
    "./node_modules/flowbite/**/*.{js,ts}",
    './node_modules/primevue/**/*.{vue,js,ts}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        'primary-50': '#fcfde9',
        'primary-100': '#f6fbc6',
        'primary-200': '#f2f890',
        'primary-300': '#f2f450',
        'primary': '#efe921',
        'primary-500': '#dfd013',
        'primary-600': '#c0a60e',
        'primary-700': '#9a790e',
        'primary-800': '#7f5f14',
        'primary-900': '#6c4e17',
        'primary-950': '#3f2909'
      }
    },
  },
  plugins: [
    require('tailwindcss-primeui'), 
    require('flowbite/plugin'), 
    require('tailwindcss-motion'),
  ]
}

