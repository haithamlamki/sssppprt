# Pre-Deployment Checklist

Use this checklist to ensure everything is ready for Git and Vercel deployment.

## ✅ Git Configuration

- [x] `.gitignore` - Comprehensive ignore rules
- [x] `.gitattributes` - Line ending normalization
- [x] `GIT_SETUP.md` - Git setup guide
- [x] `uploads/.gitkeep` - Preserves uploads directory structure

### Files to Commit

**Configuration Files:**
- [x] `package.json` - Dependencies and scripts
- [x] `tsconfig.json` - TypeScript configuration
- [x] `vite.config.ts` - Vite build configuration
- [x] `tailwind.config.ts` - Tailwind CSS configuration
- [x] `postcss.config.js` - PostCSS configuration
- [x] `drizzle.config.ts` - Database configuration
- [x] `components.json` - UI components configuration
- [x] `vercel.json` - Vercel deployment configuration

**Source Code:**
- [x] `client/` - Frontend React application
- [x] `server/` - Backend Express application
- [x] `shared/` - Shared types and schemas
- [x] `api/` - Vercel serverless functions

**Documentation:**
- [x] `README.md` - Main project documentation
- [x] `CHANGELOG.md` - Change log
- [x] `VERCEL_DEPLOYMENT.md` - Vercel deployment guide
- [x] `DEPLOYMENT_CHECKLIST.md` - Deployment checklist
- [x] `GIT_SETUP.md` - Git setup guide
- [x] `QUICK_START.md` - Quick start guide
- [x] `PRE_DEPLOYMENT_CHECKLIST.md` - This file

### Files NOT to Commit

- [ ] `.env` - Environment variables (sensitive)
- [ ] `.env.local` - Local environment variables
- [ ] `node_modules/` - Dependencies (install via npm)
- [ ] `dist/` - Build output (generated)
- [ ] `uploads/*` - Uploaded files (ephemeral)
- [ ] `.vercel/` - Vercel deployment files
- [ ] `*.log` - Log files
- [ ] `.DS_Store` - OS files

## ✅ Vercel Configuration

- [x] `vercel.json` - Vercel deployment config
- [x] `.vercelignore` - Files to ignore during deployment
- [x] `api/index.ts` - Main serverless function handler
- [x] `api/uploads/[filename].ts` - File upload handler
- [x] `package.json` - Build scripts configured

### Environment Variables to Set in Vercel

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `SESSION_SECRET` - Session encryption secret
- [ ] `NODE_ENV` - Set to `production` (auto-set by Vercel)

## ✅ Build Configuration

- [x] `package.json` build script: `"build": "vite build"`
- [x] Output directory: `dist/public`
- [x] TypeScript configuration includes `api/` directory
- [x] Vite configured for production builds

## ✅ Code Quality

- [x] TypeScript compiles without errors
- [x] No linter errors
- [x] All dependencies in `package.json`
- [x] No hardcoded secrets or credentials

## ✅ Documentation

- [x] README.md - Project overview
- [x] VERCEL_DEPLOYMENT.md - Deployment instructions
- [x] DEPLOYMENT_CHECKLIST.md - Deployment steps
- [x] GIT_SETUP.md - Git workflow
- [x] QUICK_START.md - Quick start guide

## Pre-Commit Checklist

Before committing to Git:

1. [ ] Run `npm run check` - Verify TypeScript compiles
2. [ ] Run `npm run build` - Verify build succeeds
3. [ ] Check `git status` - Review what will be committed
4. [ ] Verify no `.env` files are staged
5. [ ] Verify no sensitive data in code
6. [ ] Write clear commit message

## Pre-Deploy Checklist

Before deploying to Vercel:

1. [ ] All environment variables set in Vercel dashboard
2. [ ] Database is accessible from Vercel
3. [ ] Build command works locally: `npm run build`
4. [ ] Test API endpoints locally
5. [ ] Review `vercel.json` configuration
6. [ ] Check function timeout settings (30s for API, 10s for uploads)

## Deployment Steps

### 1. Git Setup

```bash
# Initialize (if needed)
git init

# Add remote
git remote add origin <your-repo-url>

# Stage files
git add .

# Commit
git commit -m "Initial commit: Ready for deployment"

# Push
git push -u origin main
```

### 2. Vercel Setup

```bash
# Install CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Set environment variables (in dashboard or CLI)
vercel env add DATABASE_URL
vercel env add SESSION_SECRET

# Deploy
vercel --prod
```

## Post-Deployment

After deployment:

1. [ ] Verify site is accessible
2. [ ] Test API endpoints
3. [ ] Test authentication
4. [ ] Check function logs in Vercel dashboard
5. [ ] Monitor for errors
6. [ ] Test file uploads (if applicable)

## Troubleshooting

### Build Fails
- Check build logs in Vercel
- Verify Node.js version (18+)
- Check for missing dependencies

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Supabase connection settings
- Ensure SSL is enabled

### Function Timeouts
- Check function execution time
- Increase `maxDuration` in `vercel.json` if needed
- Optimize slow queries

## Next Steps

1. ✅ Complete this checklist
2. ✅ Commit to Git
3. ✅ Deploy to Vercel
4. ✅ Verify deployment
5. ✅ Monitor and optimize

## Support

- 📚 See [README.md](./README.md)
- 🚀 See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- 📝 See [CHANGELOG.md](./CHANGELOG.md)

