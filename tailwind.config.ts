import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fdf3ee",
          100: "#fae3d4",
          200: "#f4c4a3",
          300: "#ec9e6b",
          400: "#e37036",
          500: "#c4541a",
          600: "#a84214",
          700: "#8a3310",
          800: "#6e280d",
          900: "#4e1c09",
        },
        warm: {
          50:  "#faf8f5",
          100: "#f2ede6",
        },
      },
      fontFamily: {
        sans: ["Montserrat", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
