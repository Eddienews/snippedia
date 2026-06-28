// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  /* ────────── Dev server ────────── */
  server: {
    host: "::",
    port: 8080,
  },

  /* ────────── Plugins ────────── */
  plugins: [
    react(),
    VitePWA({
      injectRegister: false,
      registerType: "autoUpdate",
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      includeAssets: [
        "icon-192x192.png",
        "icon-512x512.png",
        "favicon.ico",
        "robots.txt",
      ],
      manifest: {
        name: "Snippedia",
        short_name: "Snippedia",
        display: "standalone",
        start_url: "/",
        background_color: "#ffffff",
        theme_color: "#FE2C55",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ].filter(Boolean),

  /* ────────── Alias ────────── */
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },

  /* ────────── Build ────────── */
  build: {
    outDir: "../public_html", // gera direto na pasta servida
    emptyOutDir: true,
  },
}));
