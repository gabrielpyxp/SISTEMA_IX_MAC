/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bordo: "#5C161B",
        bordoHover: "#3E0F12",
        dourado: "#FACC15",
        douradoHover: "#EAB308",
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] }
    },
  },
  plugins: [],
}
