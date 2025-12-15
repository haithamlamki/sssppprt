# Vercel Deployment Checklist

Use this checklist to ensure your project is ready for deployment to Vercel.

## Pre-Deployment

### 1. Environment Variables
- [ ] `DATABASE_URL` - PostgreSQL connection string (Supabase)
- [ ] `SESSION_SECRET` - Random secret for session encryption
- [ ] Verify all environment variables are set in Vercel dashboard

### 2. Build Configuration
- [ ] Verify `package.json` has correct build script: `"build": "vite build"`
- [ ] Test build locally: `npm run build`
- [ ] Verify `dist/public` directory is created after build

### 3. Dependencies
- [ ] Run `npm install` to ensure all dependencies are installed
- [ ] Verify `serverless-http` is in dependencies
- [ ] Check for any missing dependencies

### 4. File Uploads
- [ ] **IMPORTANT**: Understand that `/tmp` is ephemeral
- [ ] Decide on external storage solution (S3, Cloudinary, etc.)
- [ ] Update upload logic if using external storage
- [ ] Test file upload functionality

### 5. Database
- [ ] Verify Supabase connection string is correct
- [ ] Test database connection
- [ ] Ensure SSL is enabled for Supabase
- [ ] Run migrations if needed

## Deployment Steps

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login
```bash
vercel login
```

### 3. Link Project
```bash
vercel link
```

### 4. Set Environment Variables
```bash
vercel env add DATABASE_URL
vercel env add SESSION_SECRET
```

Or set in Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add for Production, Preview, and Development

### 5. Deploy
```bash
vercel --prod
```

Or push to main branch if GitHub integration is enabled.

## Post-Deployment

### 1. Verify Deployment
- [ ] Check Vercel dashboard for successful deployment
- [ ] Visit deployed URL
- [ ] Test API endpoints
- [ ] Test authentication
- [ ] Test file uploads (if applicable)

### 2. Monitor
- [ ] Check function logs in Vercel dashboard
- [ ] Monitor function execution times
- [ ] Set up error alerts if needed

### 3. Performance
- [ ] Check function cold start times
- [ ] Monitor database connection pooling
- [ ] Optimize if needed

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify Node.js version (18+)
- Check for missing dependencies
- Verify build script is correct

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check Supabase connection settings
- Ensure SSL is enabled
- Check network/firewall settings

### File Upload Issues
- Remember `/tmp` is ephemeral
- Consider external storage
- Check file size limits
- Verify upload endpoint is working

### Function Timeouts
- Check function execution time
- Increase `maxDuration` in `vercel.json` if needed
- Optimize slow queries
- Consider caching

## Important Notes

1. **File Storage**: Files in `/tmp` are temporary. Use external storage for production.
2. **Cold Starts**: First request may be slower due to cold start.
3. **Environment Variables**: Must be set for each environment (Production/Preview/Development).
4. **Database Connections**: Connection pooling is configured, but monitor for issues.
5. **Static Files**: Served from `dist/public` after build.

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Project README: See README.md

