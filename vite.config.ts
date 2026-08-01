import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Plain Vite + React. No TanStack Router, no file-based routing, no
// Cloudflare Worker bindings — this is a static site that imports cleanly
// into the AKAL repo.
export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
    sourcemap: false,
  },
});
