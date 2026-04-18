# NEXUS Deployment Guide

## Vercel Deployment Status

✅ **Deployed to Vercel**
- Production URL: https://n-e-x-u-{hash}.vercel.app
- Status: Building

### Environment Variables Required in Vercel

Add these to your Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-api-key
NEXT_PUBLIC_APP_URL=your-vercel-domain
CRON_SECRET=your-cron-secret
```

## GitHub Repository Setup

To push this project to GitHub and connect it to Vercel:

### Option 1: Using GitHub Web Interface (Recommended)

1. Go to https://github.com/new
2. Create a new repository:
   - **Name**: `nexus-healthcare` (or your preferred name)
   - **Description**: "A comprehensive free healthcare discovery platform"
   - **Public** or **Private** (your choice)
   - **Don't** initialize with README, .gitignore, or license (we have these)
3. Click "Create repository"
4. From the local repository, add the GitHub remote:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/nexus-healthcare.git
   git branch -M main
   git push -u origin main
   ```

### Option 2: Using GitHub CLI (if installed)

```bash
gh repo create nexus-healthcare --public --source=. --remote=origin --push
```

## Connect to Vercel via GitHub

Once your repository is on GitHub:

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Find and select `nexus-healthcare`
5. Configure project settings:
   - Framework: Next.js (should auto-detect)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
6. Add environment variables (from list above)
7. Click "Deploy"

Vercel will automatically:
- Deploy on every push to `main`
- Generate preview deployments for pull requests
- Configure production domain

## Cron Jobs Configuration

All cron jobs are pre-configured in `vercel.json`:

| Job | Schedule | Purpose |
|-----|----------|---------|
| refresh-clinics | Sunday 2 AM UTC | Validate HRSA clinic data freshness |
| broken-links | Monday 3 AM UTC | Check all program links |
| weekly-digest | Monday 8 AM UTC | Compile impact metrics & email |

Set `CRON_SECRET` environment variable to authorize requests.

## Database Setup (Supabase)

Run these SQL commands in Supabase SQL Editor:

```sql
-- See supabase-setup.sql for full schema
-- Or copy from README.md Database Setup section
```

## Local Development

```bash
# Install dependencies
npm install

# Create .env.local with required variables
# See Environment Variables section above

# Run development server
npm run dev

# Visit http://localhost:3000
```

## Production Monitoring

After deployment:

1. **Monitor builds**: https://vercel.com/dashboard
2. **Check logs**: Vercel → Project → Deployments → Logs
3. **Health checks**: /api/cron/refresh-clinics (Monday check)
4. **Clinic data**: Query supabase.clinics_cache table

## Troubleshooting

**Build fails with TypeScript errors:**
- Ensure `tsconfig.json` excludes `scripts/` directory ✅
- Check that all imports are correct
- Run `npm run build` locally first

**Cron jobs not running:**
- Verify `CRON_SECRET` is set in Vercel environment
- Check Vercel logs for authorization errors
- Ensure routes exist: `/api/cron/refresh-clinics`, etc.

**Chat widget errors:**
- Verify `ANTHROPIC_API_KEY` is set
- Check Claude Haiku API quota
- Review browser console for errors

**Clinic data not loading:**
- Verify Supabase URL and keys are correct
- Check Supabase RLS policies
- Run seed script if database is empty: `npx ts-node scripts/seed-hifld.ts`

## Next Steps

- [ ] Create GitHub repository
- [ ] Connect GitHub to Vercel
- [ ] Set environment variables in Vercel
- [ ] Set up Supabase database
- [ ] Test clinic finder at /search
- [ ] Test chat widget
- [ ] Monitor first cron job execution
- [ ] Set up production domain (optional)

## Support

For deployment issues:
- Vercel docs: https://vercel.com/docs
- Next.js deployment: https://nextjs.org/docs/deployment
- Supabase guides: https://supabase.com/docs/guides

---

**Last updated**: April 2026
