/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // This line typically covers JS, TS, JSX, TSX files inside a 'src' folder:
    "./src/**/*.{js,ts,jsx,tsx,html}", 
    // Add any other paths if your project structure is different, e.g., for Django or PHP:
    // "./templates/**/*.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
