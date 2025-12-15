import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";

// vite.ts is only used in development, not in Vercel production
// In Vercel, we serve static files from dist/public
// This file is not imported in production builds

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Only load vite in development
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    throw new Error('setupVite should not be called in production/Vercel');
  }

  // Lazy load vite dependencies only when needed (development)
  const vite = await import("vite");
  const { nanoid } = await import("nanoid");
  const viteLogger = vite.createLogger();
  
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const viteServer = await vite.createServer({
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg: any, options?: any) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(viteServer.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Don't serve HTML for API routes
    if (url.startsWith("/api/")) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await viteServer.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      viteServer.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // In Vercel, static files are served from dist/public
  // This function is not used in serverless functions
  // Static files are handled by Vercel's static file serving
  const distPath = path.resolve(process.cwd(), "dist", "public");

  if (!fs.existsSync(distPath)) {
    // In Vercel, this is expected - static files are served separately
    console.log('Static files directory not found, skipping static file serving');
    return;
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  // but don't serve HTML for API routes
  app.use("*", (req, res, next) => {
    if (req.originalUrl.startsWith("/api/")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next();
    }
  });
}
