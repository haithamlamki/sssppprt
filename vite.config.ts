import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    // Only load runtime error overlay in development (not in Vercel production)
    // Use try-catch to gracefully handle missing plugin in production
    ...(process.env.NODE_ENV !== "production" && !process.env.VERCEL
      ? await (async () => {
          try {
            const plugin = await import("@replit/vite-plugin-runtime-error-modal");
            return [plugin.default()];
          } catch (error) {
            // Plugin not available (e.g., in production/Vercel), skip it
            return [];
          }
        })()
      : []),
    // Only load Replit-specific plugins when REPL_ID is defined
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? await (async () => {
          try {
            const [cartographer, devBanner] = await Promise.all([
              import("@replit/vite-plugin-cartographer").then((m) => m.cartographer()),
              import("@replit/vite-plugin-dev-banner").then((m) => m.devBanner()),
            ]);
            return [cartographer, devBanner];
          } catch (error) {
            // Plugins not available, skip them
            return [];
          }
        })()
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
