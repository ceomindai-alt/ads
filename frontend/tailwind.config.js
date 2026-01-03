// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Enable dark mode based on the 'class'
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#4f46e5', // Indigo-600
        'secondary': '#10b981', // Emerald-500
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}