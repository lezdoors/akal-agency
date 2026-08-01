/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        akal: {
          bg: "#0F1512",
          ink: "#F5F3EE",
          accent: "#B7E34A",
          muted: "#8E8680",
          card: "#1A1C1E",
        },
      },
      fontFamily: {
        display: ["Cabinet Grotesk", "system-ui", "sans-serif"],
        body: ["Inter Tight", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
