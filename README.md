# Abraj Sport - Sports Management Platform

A comprehensive sports management platform built with React, Express, TypeScript, and Supabase.

## Features

- 🏆 Tournament Management
- 👥 Team & Player Management
- 📊 Match Scheduling & Results
- 💬 Real-time Chat & Comments
- 📸 Media Gallery
- 📅 Event Management
- 🎯 Polls & Voting
- 📱 Responsive Design

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Passport.js with session management
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI, shadcn/ui
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Supabase recommended)
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd abraj-sport
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```bash
   DATABASE_URL=postgresql://user:password@host:port/database
   SESSION_SECRET=your-session-secret-key
   PORT=3000
   NODE_ENV=development
   ```

   Generate a session secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

4. **Set up the database**
   - Ensure your Supabase database is running
   - The application will automatically create tables on first run
   - Or run migrations manually if needed

5. **Run the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## Project Structure

```
abraj-sport/
├── api/                    # Vercel serverless functions
│   ├── index.ts           # Main API handler
│   └── uploads/           # File upload handler
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities
│   └── index.html
├── server/                 # Backend Express application
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── db.ts              # Database configuration
│   ├── auth.ts            # Authentication setup
│   └── storage.ts         # Data access layer
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schemas
├── uploads/                # Uploaded files (local)
├── vercel.json            # Vercel configuration
└── package.json           # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check TypeScript
- `npm run db:push` - Push database schema changes

## Deployment

### Vercel Deployment

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

Quick deployment:
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link project: `vercel link`
4. Set environment variables in Vercel dashboard
5. Deploy: `vercel --prod`

### Environment Variables for Production

Set these in your Vercel project settings:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption secret
- `NODE_ENV` - Set to `production`

## Documentation

- [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Changelog](./CHANGELOG.md)
- [Design Guidelines](./design_guidelines.md)

## File Uploads

**Important**: In production (Vercel), uploaded files are stored in `/tmp` which is ephemeral. Files will be deleted after function execution.

**Recommended**: Use external storage for production:
- AWS S3
- Cloudinary
- Vercel Blob Storage
- Supabase Storage

## Database

The application uses PostgreSQL with Supabase. The database schema is defined in `shared/schema.ts` and managed with Drizzle ORM.

## Authentication

- Session-based authentication using Passport.js
- Local strategy for username/password
- Role-based access control (admin, committee_member, employee)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT

## Support

For issues and questions:
- Check the documentation files
- Review the changelog for recent updates
- Contact the development team
