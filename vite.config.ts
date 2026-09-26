import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
const extraHosts = (process.env.ALLOWED_HOSTS ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: "0.0.0.0",

    // Set ALLOWED_HOSTS to a comma-separated list to pin specific hostnames
    // (for example a tunnel). Falls back to `true` so remote candidates can
    // reach the dev server without editing this file. Dev server only.
    allowedHosts: extraHosts.length > 0 ? extraHosts : true,

    proxy: {
      "/api": {
        target: process.env.API_HOST ?? "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
