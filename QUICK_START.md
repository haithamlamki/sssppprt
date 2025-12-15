# Quick Start Guide

Get up and running with Abraj Sport in minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Supabase recommended)
- Git (for version control)

## Local Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd abraj-sport

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
DATABASE_URL=postgresql://user:password@host:port/database
SESSION_SECRET=your-generated-secret-here
PORT=3000
NODE_ENV=development
```

Generate a session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Git Setup

### Initial Commit

```bash
# Initialize Git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Abraj Sport platform"

# Add remote repository
git remote add origin <your-repository-url>

# Push to remote
git branch -M main
git push -u origin main
```

See [GIT_SETUP.md](./GIT_SETUP.md) for detailed Git instructions.

## Vercel Deployment

### Quick Deploy

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Link Project**
   ```bash
   vercel link
   ```

4. **Set Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add:
     - `DATABASE_URL` - Your PostgreSQL connection string
     - `SESSION_SECRET` - Your session secret
     - `NODE_ENV` - Set to `production`

5. **Deploy**
   ```bash
   vercel --prod
   ```

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

## Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run check        # Type check

# Database
npm run db:push      # Push schema changes

# Git
git status           # Check status
git add .            # Stage changes
git commit -m "msg"  # Commit
git push             # Push to remote
```

## Project Structure

```
abraj-sport/
├── api/              # Vercel serverless functions
├── client/            # React frontend
├── server/            # Express backend
├── shared/            # Shared types/schemas
├── uploads/           # Uploaded files (local)
└── vercel.json       # Vercel config
```

## Next Steps

1. ✅ Set up local development environment
2. ✅ Configure Git repository
3. ✅ Deploy to Vercel
4. 📖 Read [README.md](./README.md) for full documentation
5. 📋 Check [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) before production

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Supabase connection settings
- Ensure SSL is enabled

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (18+)
- Verify TypeScript compiles: `npm run check`

### Port Already in Use
- Change `PORT` in `.env`
- Or kill the process using port 3000

## Support

- 📚 [Full Documentation](./README.md)
- 🚀 [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)
- 📝 [Changelog](./CHANGELOG.md)

