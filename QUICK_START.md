# ⚡ Quick Start Guide

Get Mission Control running in minutes!

## 30-Second Setup

```bash
# 1. Clone and enter directory
git clone <repo-url>
cd mission-control

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Start development server
npm run dev

# 4. Open in browser
# Visit: http://localhost:3000
```

That's it! 🎉

## What You'll See

### 📊 Activity Feed Tab
- Real-time activities from your AI agent
- Filter by status (running, completed, failed)
- Auto-refresh toggle
- Timestamps for each activity

### 📅 Calendar Tab
- Weekly view of upcoming tasks
- Color-coded priorities
- Task details and timing
- Navigate between weeks

### 🔍 Search Tab
- Search across all memories, documents, and tasks
- Tag-based filtering
- Instant results as you type

## Available Scripts

```bash
# Development
npm run dev          # Start dev server (hot reload)

# Production
npm run build        # Build for production
npm start           # Start production server

# Maintenance
npm run lint        # Check code quality
npm audit           # Check dependencies
npm audit fix       # Fix security issues
```

## Deployment (1 Click!)

### To Vercel:
1. Push code to GitHub
2. Visit https://vercel.com/new
3. Import your repository
4. Click "Deploy"

Done! Your live URL is ready immediately.

## File Structure

```
src/
├── app/              # Next.js app router
│   ├── page.tsx     # Main dashboard
│   └── globals.css  # Styling
└── components/      # React components
    ├── ActivityFeed.tsx
    ├── CalendarView.tsx
    └── SearchPanel.tsx

convex/             # Backend config (optional)
package.json        # Dependencies
README.md          # Full docs
DEPLOYMENT.md      # Deployment guide
```

## Customization

### Change Colors
Edit `src/app/globals.css` to update the dark theme colors.

### Add Mock Data
Edit component data in:
- `src/components/ActivityFeed.tsx`
- `src/components/CalendarView.tsx`
- `src/components/SearchPanel.tsx`

### Update Dashboard Title
Edit `src/app/page.tsx` header section.

## Connect to Convex (Optional)

For real-time database features:

1. Sign up at https://convex.dev
2. Create a project and get your URL
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   ```
4. Restart dev server

## Troubleshooting

### Port 3000 Already in Use
```bash
npm run dev -- -p 3001  # Use different port
```

### Dependencies Won't Install
```bash
npm install --legacy-peer-deps
```

### Build Fails
```bash
npm run build  # See detailed error
rm -rf .next   # Clear cache and retry
```

### TypeScript Errors
```bash
npm run lint --fix  # Auto-fix issues
```

## Next Steps

1. ✅ Run locally with `npm run dev`
2. ✅ Customize colors and content
3. ✅ Deploy to Vercel with one click
4. ✅ Share your dashboard URL!

## Pro Tips

💡 **Real-time Updates**: Connect Convex to sync activities from your agents

💡 **Notifications**: Add email alerts for critical tasks

💡 **Mobile**: Dashboard works great on phones and tablets

💡 **Dark Theme**: Built-in dark mode for all-night monitoring

## Questions?

- Check `README.md` for full documentation
- See `DEPLOYMENT.md` for deployment help
- Review code comments in component files
- Check Vercel/Next.js docs for framework questions

## Resources

- 📖 [Next.js Docs](https://nextjs.org/docs)
- 🎨 [Tailwind CSS Docs](https://tailwindcss.com/docs)
- 🔌 [Convex Docs](https://docs.convex.dev)
- 🚀 [Vercel Docs](https://vercel.com/docs)

---

**Ready to go!** Start with `npm run dev` and build something amazing. 🚀
