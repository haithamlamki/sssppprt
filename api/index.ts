import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { registerRoutes } from './server/routes';
import { storage } from './server/storage';

// Cache the Express app instance
let cachedApp: express.Express | null = null;

async function createApp(): Promise<express.Express> {
  if (cachedApp) {
    return cachedApp;
  }

  console.log('🚀 Creating Express app...');
  console.log('📁 Current working directory:', process.cwd());
  console.log('🔍 Checking for server files...');
  
  // Verify server files exist
  const serverRoutesPath = path.join(process.cwd(), 'api', 'server', 'routes.ts');
  const serverStoragePath = path.join(process.cwd(), 'api', 'server', 'storage.ts');
  const sharedSchemaPath = path.join(process.cwd(), 'api', 'shared', 'schema.ts');
  
  console.log('📄 server/routes.ts exists:', fs.existsSync(serverRoutesPath));
  console.log('📄 server/storage.ts exists:', fs.existsSync(serverStoragePath));
  console.log('📄 shared/schema.ts exists:', fs.existsSync(sharedSchemaPath));
  
  // Check DATABASE_URL
  console.log('🔐 DATABASE_URL exists:', !!process.env.DATABASE_URL);
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL is not set!');
  }

  const app = express();
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Initialize sample data on first run
  try {
    await storage.initializeSampleData();
  } catch (error) {
    console.error('Error initializing sample data:', error);
    // Continue even if initialization fails
  }
  
  // Register API routes
  try {
    await registerRoutes(app);
  } catch (error) {
    console.error('Error registering routes:', error);
    throw error; // Re-throw to see the actual error
  }
  
  // Serve static files from dist/public in production
  // Note: In Vercel, static files are served automatically from outputDirectory
  // This is only for when running in serverless function context
  const distPath = path.join(process.cwd(), 'dist', 'public');
  if (fs.existsSync(distPath)) {
    // Only serve static files if we're in a serverless function (not Vercel's static serving)
    // Check if we're in Vercel by checking for VERCEL env var
    if (process.env.VERCEL) {
      // In Vercel, static files are served separately, so we only need to handle SPA routing
      // Fallback to index.html for SPA routing (but not for API routes or static assets)
      app.use('*', (req, res, next) => {
        const url = req.originalUrl;
        // Skip API routes
        if (url.startsWith('/api/') || url.startsWith('/uploads/')) {
          return next();
        }
        // Skip static assets (files with extensions)
        if (url.match(/\.[a-zA-Z0-9]+$/)) {
          return next();
        }
        // Serve index.html for SPA routes
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          next();
        }
      });
    } else {
      // Not in Vercel, serve static files normally
      app.use(express.static(distPath));
      
      // Fallback to index.html for SPA routing (but not for API routes)
      app.use('*', (req, res, next) => {
        if (req.originalUrl.startsWith('/api/')) {
          return next();
        }
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          next();
        }
      });
    }
  }
  
  // Store the app for reuse
  cachedApp = app;
  
  return app;
}

// Vercel serverless function handler
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const app = await createApp();
    
    // Use serverless-http to wrap Express app
    const { default: serverless } = await import('serverless-http');
    const handler = serverless(app, {
      binary: ['image/*', 'application/pdf'],
    });
    
    return handler(req, res);
  } catch (error: any) {
    console.error('Error in Vercel handler:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

