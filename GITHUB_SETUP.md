# GitHub Repository Setup Guide

## Status
✅ Project is committed locally and ready for GitHub
✅ Vercel deployment is live (see DEPLOYMENT.md)
⏳ GitHub repository setup is manual (requires web interface)

## Quick Setup (5 minutes)

### Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Fill in the form:
   - **Repository name**: `nexus-healthcare`
   - **Description**: "A comprehensive free healthcare discovery platform connecting uninsured Americans with free clinics, sliding-scale care, and eligibility programs"
   - **Visibility**: Choose "Public" (for open-source) or "Private"
   - **Initialize repository**: UNCHECK all boxes (we already have these files)
   
3. Click "Create repository"

### Step 2: Push Local Repository to GitHub

Copy and paste these commands into your terminal:

```bash
# Navigate to project directory
cd "C:\Users\marwa\Desktop\N E X U S"

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/nexus-healthcare.git

# Rename branch to main (if using master)
git branch -M main

# Push all commits to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username.**

### Step 3: Verify in GitHub

1. Go to https://github.com/YOUR_USERNAME/nexus-healthcare
2. You should see:
   - ✅ All files (111 total)
   - ✅ Commit history (4 commits)
   - ✅ README.md displayed
   - ✅ MIT License (if you added one)

## What Gets Pushed to GitHub

### Included Files (pushed):
- ✅ All source code (app/, components/, lib/)
- ✅ Configuration (next.config.ts, tailwind.config.ts, etc.)
- ✅ Documentation (README.md, DEPLOYMENT.md, GITHUB_SETUP.md)
- ✅ Package files (package.json, package-lock.json)
- ✅ TypeScript config (tsconfig.json)
- ✅ Environment examples (.env.example - create this)
- ✅ Scripts (scripts/seed-hifld.ts)
- ✅ Database SQL files (supabase-*.sql)

### Excluded Files (in .gitignore):
- ❌ node_modules/
- ❌ .next/ (build output)
- ❌ .env.local (secrets)
- ❌ .vercel/
- ❌ .DS_Store

## Troubleshooting

### "fatal: remote origin already exists"
If you get this error, the remote is already configured. Check:
```bash
git remote -v
```
If it shows the wrong URL:
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/nexus-healthcare.git
```

### "fatal: Authentication failed"
GitHub no longer accepts password authentication. Use a personal access token:
1. Go to https://github.com/settings/tokens
2. Click "Generate new token"
3. Select scopes: `repo`, `workflow`
4. Copy the token
5. When Git prompts for password, paste the token instead

Or use SSH keys (recommended):
1. Generate SSH key: `ssh-keygen -t ed25519 -C "your-email@example.com"`
2. Add to GitHub: https://github.com/settings/keys
3. Use SSH URL: `git@github.com:YOUR_USERNAME/nexus-healthcare.git`

### "Permission denied (publickey)"
SSH key permissions issue. Fix with:
```bash
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
```

## Optional: Add GitHub Topics

After creating the repo, go to Settings → About and add topics:
- `healthcare`
- `free-clinics`
- `open-source`
- `nextjs`
- `telemedicine`
- `public-health`
- `uninsured`

## Optional: Create .env.example

Create a template for developers:

```bash
cat > .env.example << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic (Claude Haiku)
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Google Places API
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSy...

# Optional: Email (Resend)
RESEND_API_KEY=re_...

# Vercel Cron Secret
CRON_SECRET=your-secret-key

# Vercel Production URL
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
EOF

git add .env.example
git commit -m "docs: Add environment variables example template"
git push
```

## Next Steps

After GitHub setup:

1. **Connect to Vercel** (see DEPLOYMENT.md)
   - Go to https://vercel.com/new
   - Import from GitHub
   - Select your repository
   - Configure environment variables

2. **Enable GitHub features** (optional):
   - Branches protection rules (Settings → Rules)
   - Require pull request reviews
   - Require status checks to pass

3. **Add collaborators** (Settings → Collaborators):
   - Invite team members
   - Set permissions

4. **Create GitHub Issues** for tracking:
   - Feature requests
   - Bug reports
   - Documentation

5. **Set up CI/CD** (optional):
   - GitHub Actions for testing
   - Automated deployments
   - Code quality checks

## GitHub + Vercel Integration

Once your repo is on GitHub and Vercel is connected:

- **Main branch** → Auto-deploys to Production
- **Other branches** → Get Preview deployments
- **Pull requests** → Show deployment preview URLs
- **Commits** → Trigger rebuilds automatically

This provides:
- Continuous deployment
- Review environments for PRs
- Automatic rollback capability
- Full deployment history

## Resources

- GitHub Docs: https://docs.github.com
- GitHub SSH Setup: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
- Vercel + GitHub: https://vercel.com/docs/deployments/git#deploying-with-github
- Git Documentation: https://git-scm.com/doc

## Support

If you encounter issues:
1. Check GitHub status: https://www.githubstatus.com
2. Review your git configuration: `git config -l`
3. Check authentication: `ssh -T git@github.com`
4. View Vercel logs: https://vercel.com/dashboard

---

**Repository Status**: Ready for GitHub push  
**Vercel Status**: Live at https://n-e-x-u-{hash}.vercel.app  
**Last updated**: April 18, 2026
