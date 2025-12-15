import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';
import { storage } from '../server/storage';

// Cache the Express app instance
let cachedApp: express.Express | null = null;

async function createApp(): Promise<express.Express> {
  if (cachedApp) {
    return cachedApp;
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
  
  // Register routes
  await registerRoutes(app);
  
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
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
}

