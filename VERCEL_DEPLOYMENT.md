# Vercel Deployment Guide

This guide explains how to deploy the Abraj Sport application to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A Supabase database (or PostgreSQL database)
3. Node.js 18+ installed locally

## Environment Variables

Set the following environment variables in your Vercel project settings:

### Required Variables

- `DATABASE_URL` - PostgreSQL connection string (Supabase format)
  - Format: `postgresql://user:password@host:port/database`
  - Example: `postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres`

- `SESSION_SECRET` - Secret key for session encryption
  - Generate a random string: `openssl rand -base64 32`
  - Or use: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

- `NODE_ENV` - Set to `production` (automatically set by Vercel)

### Optional Variables

- `PORT` - Server port (defaults to 3000, Vercel handles this automatically)

## Deployment Steps

### 1. Install Vercel CLI (if not already installed)

```bash
npm i -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Link Your Project

```bash
vercel link
```

This will create a `.vercel` folder with project configuration.

### 4. Set Environment Variables

```bash
vercel env add DATABASE_URL
vercel env add SESSION_SECRET
```

Or set them in the Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable for Production, Preview, and Development environments

### 5. Build Locally (Optional - for testing)

```bash
npm run build
```

### 6. Deploy

```bash
vercel --prod
```

Or push to your main branch if you have GitHub integration enabled.

## File Uploads

**Important:** Vercel has an ephemeral filesystem. Uploaded files in `/tmp` are temporary and will be deleted after the serverless function execution.

### Recommended Solutions:

1. **Use External Storage** (Recommended)
   - AWS S3
   - Cloudinary
   - Vercel Blob Storage
   - Supabase Storage

2. **Current Implementation**
   - Files are stored in `/tmp/uploads` (ephemeral)
   - Files will be lost when the function times out
   - Suitable for development/testing only

### To Implement External Storage:

1. Update `server/routes.ts` to use your storage service
2. Modify the upload endpoint to upload to external storage
3. Update file serving to use external URLs or proxy

## Build Configuration

The project uses:
- **Build Command**: `npm run build`
- **Output Directory**: `dist/public`
- **Install Command**: `npm install`

## API Routes

All API routes are handled by the serverless function at `api/index.ts`:
- Routes are automatically mapped from `/api/*` to the serverless function
- Maximum execution time: 30 seconds
- Memory: 1024 MB

## Static Files

- Static files are served from `dist/public` after build
- Client-side routing is handled by serving `index.html` for all non-API routes

## Troubleshooting

### Build Failures

1. Check that all dependencies are in `package.json`
2. Verify Node.js version (18+)
3. Check build logs in Vercel dashboard

### Database Connection Issues

1. Verify `DATABASE_URL` is set correctly
2. Check Supabase connection settings
3. Ensure SSL is enabled (Supabase requires SSL)

### File Upload Issues

1. Remember that `/tmp` is ephemeral
2. Consider implementing external storage
3. Check file size limits (5MB default)

### Environment Variables Not Working

1. Ensure variables are set for the correct environment (Production/Preview/Development)
2. Redeploy after adding new variables
3. Check variable names match exactly (case-sensitive)

## Performance Optimization

1. **Database Connection Pooling**: Already configured in `server/db.ts`
2. **Caching**: Consider adding Redis for session storage
3. **CDN**: Vercel automatically provides CDN for static assets
4. **Function Warm-up**: Vercel handles this automatically

## Monitoring

- Check Vercel dashboard for function logs
- Monitor function execution times
- Set up alerts for errors

## Support

For issues specific to:
- **Vercel**: Check [Vercel Documentation](https://vercel.com/docs)
- **Database**: Check Supabase documentation
- **Application**: Check project README.md

