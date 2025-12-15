import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createReadStream } from 'fs';
import { join } from 'path';
import { existsSync } from 'fs';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const { filename } = req.query;
    
    if (!filename || typeof filename !== 'string') {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // In Vercel, uploaded files should be stored in /tmp (ephemeral)
    // For production, consider using external storage (S3, Cloudinary, etc.)
    const filePath = join('/tmp', 'uploads', filename);
    
    // Fallback to local uploads directory for development
    const localPath = join(process.cwd(), 'uploads', filename);
    
    const finalPath = existsSync(filePath) ? filePath : 
                      existsSync(localPath) ? localPath : null;

    if (!finalPath || !existsSync(finalPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Determine content type based on file extension
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentType = 
      ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
      ext === 'png' ? 'image/png' :
      ext === 'gif' ? 'image/gif' :
      ext === 'webp' ? 'image/webp' :
      'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    
    const stream = createReadStream(finalPath);
    stream.pipe(res);
    
    stream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error reading file' });
      }
    });
  } catch (error: any) {
    console.error('Error in uploads handler:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
}

