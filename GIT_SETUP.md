# Git Setup Guide

This guide will help you set up Git for this project and prepare it for version control.

## Initial Git Setup

### 1. Initialize Git Repository (if not already done)

```bash
git init
```

### 2. Add Remote Repository

```bash
git remote add origin <your-repository-url>
```

Or if using GitHub:
```bash
git remote add origin https://github.com/yourusername/abraj-sport.git
```

### 3. Stage All Files

```bash
git add .
```

### 4. Create Initial Commit

```bash
git commit -m "Initial commit: Abraj Sport platform"
```

### 5. Push to Remote

```bash
git branch -M main
git push -u origin main
```

## Important: Files NOT Tracked by Git

The following files/directories are ignored (see `.gitignore`):

- `.env` - Environment variables (contains sensitive data)
- `node_modules/` - Dependencies
- `dist/` - Build output
- `uploads/*` - Uploaded files (directory structure is tracked via `.gitkeep`)
- `.vercel/` - Vercel deployment files
- Log files and temporary files

## Environment Variables

**Never commit `.env` files!** They contain sensitive information like database credentials and session secrets.

Instead:
1. Keep `.env` local only
2. Set environment variables in Vercel dashboard for production
3. Share required variables with team members securely (not via Git)

## Git Workflow

### Creating a New Feature

```bash
# Create and switch to new branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add: Description of your feature"

# Push to remote
git push origin feature/your-feature-name
```

### Updating from Remote

```bash
# Fetch latest changes
git fetch origin

# Merge or rebase
git merge origin/main
# OR
git rebase origin/main
```

### Before Committing

Always check what you're committing:
```bash
git status
git diff
```

## Commit Message Guidelines

Use clear, descriptive commit messages:

- `Add: Feature description` - New features
- `Fix: Bug description` - Bug fixes
- `Update: What was updated` - Updates to existing features
- `Refactor: What was refactored` - Code refactoring
- `Docs: Documentation changes` - Documentation updates
- `Style: Styling changes` - CSS/styling changes
- `Test: Test additions/changes` - Test-related changes

## Branch Naming

- `main` or `master` - Production-ready code
- `develop` - Development branch
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `hotfix/issue-description` - Urgent fixes

## Pre-Commit Checklist

Before committing, ensure:

- [ ] No `.env` files are included
- [ ] No sensitive data (passwords, API keys) in code
- [ ] No `node_modules` or `dist` directories
- [ ] Code is properly formatted
- [ ] TypeScript compiles without errors (`npm run check`)
- [ ] Commit message is clear and descriptive

## Common Git Commands

```bash
# Check status
git status

# View changes
git diff

# Stage specific file
git add path/to/file

# Unstage file
git reset path/to/file

# View commit history
git log

# Create and switch branch
git checkout -b branch-name

# Switch branch
git checkout branch-name

# Merge branch
git merge branch-name

# Delete branch
git branch -d branch-name
```

## Troubleshooting

### Accidentally Committed .env File

```bash
# Remove from Git (but keep local file)
git rm --cached .env

# Add to .gitignore (if not already)
echo ".env" >> .gitignore

# Commit the fix
git commit -m "Remove .env from tracking"
```

### Undo Last Commit (Keep Changes)

```bash
git reset --soft HEAD~1
```

### Undo Last Commit (Discard Changes)

```bash
git reset --hard HEAD~1
```

### View Remote URL

```bash
git remote -v
```

## Integration with Vercel

When you push to your main branch:
1. Vercel automatically detects changes
2. Builds and deploys automatically (if auto-deploy is enabled)
3. Creates preview deployments for pull requests

To disable auto-deploy:
- Go to Vercel project settings
- Disable "Automatic deployments from Git"

## Security Best Practices

1. **Never commit secrets**: API keys, passwords, tokens
2. **Use environment variables**: Store secrets in `.env` or Vercel dashboard
3. **Review changes**: Always review `git diff` before committing
4. **Use .gitignore**: Ensure sensitive files are ignored
5. **Rotate secrets**: If secrets are accidentally committed, rotate them immediately

## Next Steps

After setting up Git:
1. Set up Vercel deployment (see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md))
2. Configure environment variables in Vercel
3. Set up branch protection rules (if using GitHub)
4. Configure CI/CD if needed

