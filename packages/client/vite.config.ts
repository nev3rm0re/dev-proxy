import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: "./postcss.config.js",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/api": `http://localhost:${process.env.API_PORT || 3001}`,
      "/ws": {
        target: `ws://localhost:${process.env.WS_PORT || 3001}`,
        ws: true,
      },
    },
  },
});
