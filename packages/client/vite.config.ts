import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { DEFAULT_ADMIN_PORT } from "../server/src/index.js";

const ADMIN_PORT = process.env.ADMIN_PORT || DEFAULT_ADMIN_PORT;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: "./postcss.config.js",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": `http://localhost:${ADMIN_PORT}`,
      "/ws": {
        target: `ws://localhost:${ADMIN_PORT}`,
        ws: true,
      },
    },
  },
});
