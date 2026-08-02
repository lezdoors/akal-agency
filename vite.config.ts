import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// Plain Vite + React. No TanStack Router, no file-based routing. Static site
// that carries the procedural globe (three.js) as the AKAL presentation layer.
// "@" resolves to src so the lab's ported systems import unchanged.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    target: "es2020",
    sourcemap: false,
  },
});
