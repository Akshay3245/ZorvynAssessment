/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d8eaff",
          200: "#b8d7ff",
          300: "#8bbcff",
          400: "#5b97ff",
          500: "#3a79f7",
          600: "#265de0",
          700: "#1f4ac2",
          800: "#1f3f9c",
          900: "#223a7b"
        }
      }
    }
  },
  plugins: []
};
