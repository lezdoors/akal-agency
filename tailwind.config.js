/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        akal: {
          ground: "#0A0C10",
          panel: "#12151B",
          hairline: "#20262F",
          ink: "#EFF2F6",
          muted: "#98A2B0",
          accent: "#7FA7C4",
        },
      },
      fontFamily: {
        display: [
          "Geist Variable",
          "Geist",
          "system-ui",
          "sans-serif",
        ],
        mono: ["Geist Mono Variable", "Geist Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
