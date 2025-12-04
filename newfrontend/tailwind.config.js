/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#16d857ff",     // Emerald Green (main)
        secondary: "#34D399",   // Light Green
        accent: "#059669",      // Dark Green
        bg: "#F0FDF4",          // Background
      },
      fontFamily: {
        sans: ['"Poppins"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}