import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf4ec",
          100: "#fae6d1",
          200: "#f2c99b",
          300: "#e8a862",
          400: "#dc8935",
          500: "#b5651d", // primary — warm academic brass/copper (Ajanta manuscript tone)
          600: "#954f17",
          700: "#763d14",
          800: "#5c3113",
          900: "#4a2a12",
          950: "#2a1608",
        },
        ink: {
          50: "#f5f6f7",
          100: "#e6e8eb",
          200: "#c7ccd2",
          300: "#9aa3ad",
          400: "#687380",
          500: "#4a5563",
          600: "#3a4451",
          700: "#2f3742",
          800: "#1f242c",
          900: "#14171c",
          950: "#0a0c0f",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "'Times New Roman'", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,23,28,0.06), 0 1px 12px rgba(20,23,28,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
