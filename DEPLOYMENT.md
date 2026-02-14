# 🚀 Deployment Guide - Mission Control Dashboard

This guide walks you through deploying Mission Control to production on Vercel.

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- Convex account (optional, for real-time features)
- Git installed locally

## Step 1: Prepare Repository

### 1.1 Commit Your Changes

```bash
cd mission-control
git status
git add .
git commit -m "chore: Prepare for production deployment"
git push origin main
```

### 1.2 Verify Build Locally

```bash
npm run build
npm start
```

Visit http://localhost:3000 to verify everything works.

## Step 2: Deploy to Vercel

### 2.1 Connect GitHub to Vercel

1. Go to https://vercel.com
2. Click "Log in" or sign up with GitHub
3. Click "New Project"
4. Select "Import Git Repository"
5. Search for your `mission-control` repository
6. Click "Import"

### 2.2 Configure Project Settings

**Framework Preset**
- Vercel should auto-detect Next.js
- If not, select "Next.js" from the dropdown

**Build Settings**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install --legacy-peer-deps`

### 2.3 Environment Variables

In the Vercel dashboard, add these environment variables:

```
# If using Convex
NEXT_PUBLIC_CONVEX_URL = https://your-deployment.convex.cloud

# Optional: Convex deployment ID
CONVEX_DEPLOYMENT = your-deployment-id
```

> **Note**: Only include variables you're actually using. The app works with mock data without Convex.

### 2.4 Deploy

1. Click "Deploy"
2. Vercel will build and deploy automatically
3. Wait for the deployment to complete (~2-3 minutes)
4. Click the deployment URL to view your live dashboard

## Step 3: Verify Production Deployment

1. Visit your Vercel URL
2. Test all features:
   - ✓ Activity Feed loads correctly
   - ✓ Calendar view displays tasks
   - ✓ Search functionality works
   - ✓ Responsive design on mobile
   - ✓ No console errors

## Step 4: Set Up Custom Domain (Optional)

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (~24 hours)

## Step 5: Configure Convex (Optional, for Real-time Features)

### 5.1 Create Convex Project

1. Go to https://dashboard.convex.dev
2. Click "Create project"
3. Follow setup instructions
4. Copy your deployment URL

### 5.2 Push Convex Schema

```bash
# Install Convex CLI
npm install -g convex

# Login to Convex
convex login

# Push schema to Convex
convex push --prod
```

### 5.3 Update Vercel Environment Variables

Add your Convex URL to Vercel:

```
NEXT_PUBLIC_CONVEX_URL = https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT = your-deployment-id
```

## Step 6: Enable Auto-Deployments

1. In Vercel dashboard, go to Settings → Git Configuration
2. Select "Automatic" for deployment on new commits
3. Choose which branches to auto-deploy (typically "main")

Now every push to your main branch automatically deploys!

## Monitoring & Analytics

### View Deployment Status
- Vercel Dashboard → Deployments
- See build logs, performance metrics
- Rollback to previous versions if needed

### Enable Analytics
1. Vercel Settings → Analytics
2. View traffic, page performance, Web Vitals

### Monitor Errors
1. Set up Sentry (optional): https://sentry.io
2. Get real-time error notifications
3. Track user session data

## Troubleshooting

### Build Fails

Check the build logs in Vercel dashboard:
1. Click the failed deployment
2. View logs to see specific error
3. Common issues:
   - Missing environment variables
   - TypeScript errors
   - Dependency conflicts

**Solution**: Run `npm run build` locally to debug.

### Page Won't Load

- Clear browser cache (Cmd/Ctrl + Shift + Delete)
- Try incognito/private mode
- Check Vercel deployment status

### Slow Performance

1. Check Vercel Analytics for bottlenecks
2. Review images are optimized
3. Verify no blocking scripts

## Updating Deployment

### Deploy New Version

```bash
# Make changes locally
git add .
git commit -m "feat: Add new feature"
git push origin main

# Vercel automatically deploys!
```

### Roll Back to Previous Version

1. Vercel Dashboard → Deployments
2. Find the working deployment
3. Click three dots → Promote to Production

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Or promote from preview
vercel promote <deployment-url>
```

## Performance Optimization Checklist

- [ ] Enable Vercel Analytics
- [ ] Configure ISR (Incremental Static Regeneration) if needed
- [ ] Monitor Core Web Vitals
- [ ] Compress images
- [ ] Lazy load components
- [ ] Enable HTTP/2
- [ ] Use edge caching

## Security Best Practices

- [ ] Use HTTPS (automatic with Vercel)
- [ ] Set secure environment variables (never in code)
- [ ] Enable CORS headers as needed
- [ ] Configure CSP (Content Security Policy)
- [ ] Keep dependencies updated
- [ ] Use npm audit regularly

```bash
npm audit
npm audit fix
```

## Maintenance Schedule

### Weekly
- Monitor error rates
- Check performance metrics
- Review deployment logs

### Monthly
- Update dependencies
- Review and update documentation
- Audit security settings

### Quarterly
- Review and optimize costs
- Plan feature improvements
- Update README if needed

## Cost Estimation

**Vercel (Free Tier)**
- ✓ 100 deployments/month
- ✓ Edge computing
- ✓ 12GB build hours/month
- ✓ 100GB bandwidth/month

**Convex (Free Tier)**
- ✓ 1 deployment
- ✓ 250 function calls/day
- ✓ 1GB storage
- ✓ 5GB bandwidth/month

Upgrade as needed for production traffic.

## Useful Commands

```bash
# View deployment logs
vercel logs <deployment-url>

# View build output size
vercel analytics --help

# Deploy with custom name
vercel --prod --name production

# Clear cache and redeploy
vercel --prod --skip-build
```

## Support & Resources

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Convex Docs: https://docs.convex.dev
- GitHub Issues: Create an issue in your repo

## Deployment Checklist

Before deploying to production:

- [ ] All features tested locally
- [ ] No console errors or warnings
- [ ] Environment variables configured
- [ ] README updated with deployment URL
- [ ] CHANGELOG updated
- [ ] Performance tested (Lighthouse)
- [ ] Mobile responsive verified
- [ ] Security audit passed
- [ ] Backup/rollback plan ready

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Test all features in production
3. ✅ Set up monitoring and analytics
4. ✅ Configure custom domain (if using)
5. ✅ Share dashboard URL with team
6. ✅ Set up CI/CD pipeline
7. ✅ Document for maintenance team

---

**Deployment successful!** Your Mission Control dashboard is now live. 🎉

Share your deployment URL and enjoy real-time AI agent monitoring!
