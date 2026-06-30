/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3fbf4",
          100: "#ddf5e2",
          200: "#bae9c4",
          300: "#8bd89b",
          400: "#57c06e",
          500: "#319b49",
          600: "#23793a",
          700: "#1d5f31",
          800: "#194c29",
          900: "#173f24"
        },
        accent: "#9ad95f"
      },
      boxShadow: {
        panel: "0 10px 30px rgba(18, 52, 34, 0.08)"
      }
    },
  },
  plugins: [],
};

