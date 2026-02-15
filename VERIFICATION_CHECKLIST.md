# Setup Verification Checklist

Use this checklist to verify the Proactive Intelligence System is fully integrated and working.

## 🔧 Installation Phase

- [ ] Dependencies installed (`npm install`)
- [ ] No build errors (`npm run build`)
- [ ] Dev server starts (`npm run dev`)
- [ ] Localhost:3000 loads in browser

## 🗄️ Database Phase

- [ ] Supabase account created
- [ ] Project credentials obtained
- [ ] SQL schema applied to Supabase
- [ ] Tables created:
  - [ ] `proactive_actions`
  - [ ] `patterns`
  - [ ] `opportunities`
  - [ ] `decisions`
  - [ ] `intelligence_cache`
  - [ ] `proactive_preferences`
- [ ] Indexes created
- [ ] Realtime enabled

## 🔑 Environment Configuration

- [ ] `.env.local` file created
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set
- [ ] (Optional) GitHub token configured
- [ ] (Optional) Vercel token configured

## 🎨 UI Integration

- [ ] Proactive tab visible in Mission Control
- [ ] Can click between tabs without errors
- [ ] Other tabs still work (Activity, Calendar, Documentation, Search)
- [ ] No console errors on tab switch

## 📊 Data Features

### Activity Logging
- [ ] "Log Activity" button works
- [ ] Can log new activities
- [ ] Activities appear in Activity Log tab
- [ ] Activities show in Proactive → Actions section

### Task Management
- [ ] "New Task" button works in Calendar tab
- [ ] Can create tasks
- [ ] Tasks appear in Calendar view
- [ ] Tasks can be marked complete

### Pattern Analysis
- [ ] "Analyze Patterns" button works
- [ ] Analysis completes without errors
- [ ] Patterns appear in Proactive → Patterns
- [ ] Each pattern shows:
  - [ ] Name and category
  - [ ] Confidence score
  - [ ] Impact score
  - [ ] Suggested action

### Opportunity Finding
- [ ] "Find Opportunities" button works
- [ ] Opportunities are discovered
- [ ] Opportunities appear in Proactive → Opportunities
- [ ] Each opportunity shows:
  - [ ] Title and description
  - [ ] Type (automation, monetization, etc.)
  - [ ] Potential value (low/medium/high)
  - [ ] Effort estimate
  - [ ] Priority score
  - [ ] Action buttons (Investigate, Implement)

### Smart Stats
- [ ] Stats cards display:
  - [ ] Actions Today count
  - [ ] Opportunities Found count
  - [ ] Patterns Detected count
  - [ ] Confidence score percentage
- [ ] Stats update when new data added

## 🔄 Real-Time Features

- [ ] Create activity and see it appear instantly
- [ ] Switch to another tab and back - activity still there
- [ ] Stats update without page refresh
- [ ] Pattern analysis shows results in real-time

## 🧪 API Endpoints

Test each endpoint using curl or Postman:

### Actions Endpoint
```bash
curl http://localhost:3000/api/proactive/actions
```
- [ ] Returns list of actions
- [ ] Status codes correct (200 for success)
- [ ] Response format valid JSON

### Patterns Endpoint
```bash
curl -X POST http://localhost:3000/api/proactive/patterns
```
- [ ] Pattern analysis runs
- [ ] Returns detected patterns
- [ ] Patterns have data structure

### Opportunities Endpoint
```bash
curl -X POST http://localhost:3000/api/proactive/opportunities
```
- [ ] Opportunity finder runs
- [ ] Returns list of opportunities
- [ ] Each has required fields

### Decide Endpoint
```bash
curl -X POST http://localhost:3000/api/proactive/decide \
  -H "Content-Type: application/json" \
  -d '{"type":"recommend","data":{}}'
```
- [ ] Decision engine responds
- [ ] Returns decision with reasoning
- [ ] Confidence score included

## 📱 UI Polish

### Animations
- [ ] Tab switching animates smoothly
- [ ] Cards fade in/out cleanly
- [ ] Hover effects work on buttons
- [ ] Loading spinners animate

### Responsiveness
- [ ] Desktop view looks good
- [ ] Tablet view responsive
- [ ] Mobile view works (if applicable)
- [ ] No horizontal scroll

### Styling
- [ ] Dark theme consistent
- [ ] Colors match existing UI
- [ ] Glassmorphism effects visible
- [ ] Text readable and sized well

## 🔗 Integration Verification

### GitHub Integration (if configured)
- [ ] GITHUB_TOKEN set
- [ ] Can fetch repos
- [ ] Patterns include language distribution

### Vercel Integration (if configured)
- [ ] VERCEL_TOKEN set
- [ ] VERCEL_TEAM_ID set
- [ ] Deployments fetched
- [ ] Deployment stats show

### Calendar Integration
- [ ] Tasks visible in calendar
- [ ] Patterns from calendar data

## 📚 Documentation

- [ ] README.md exists and is complete
- [ ] QUICKSTART.md has setup instructions
- [ ] API.md documents all endpoints
- [ ] PROACTIVE_INTELLIGENCE.md explains system
- [ ] .env.example has all variables
- [ ] No broken links in docs

## 🚀 Performance

- [ ] Page loads in <3 seconds
- [ ] Switching tabs is instant
- [ ] Pattern analysis completes in <30 seconds
- [ ] Opportunity finding completes in <20 seconds
- [ ] No memory leaks (check DevTools)
- [ ] Animations are 60fps smooth

## 🔒 Security Checks

- [ ] No API keys in code
- [ ] No secrets in git history
- [ ] Environment variables used properly
- [ ] Service role key not exposed to frontend
- [ ] CORS configured correctly
- [ ] Input validation working

## ✅ Final Verification

Test the complete workflow:

1. [ ] Create activity
2. [ ] Create task
3. [ ] Run pattern analysis
4. [ ] Find opportunities
5. [ ] Make a recommendation
6. [ ] All work without errors

## 🐛 Troubleshooting Log

If something doesn't work, document here:

Issue: _________________________________________
Status Code: ___________________________________
Error Message: __________________________________
Resolution: ______________________________________

## 📊 Success Criteria

Proactive Intelligence System is working when:

✅ All 5 database tables exist
✅ All 4 API endpoints respond
✅ ProactiveHub component renders
✅ Real-time updates work
✅ No console errors
✅ All UI animations smooth
✅ Stats display correct values
✅ Pattern analysis completes
✅ Opportunities discovered
✅ Documentation complete

## 📞 If Tests Fail

1. **Database errors**: 
   - Verify Supabase credentials
   - Check SQL schema was applied
   - Review Supabase error logs

2. **API errors**:
   - Check browser Network tab
   - Review API response details
   - Check server logs

3. **UI issues**:
   - Clear browser cache (Ctrl+F5)
   - Check DevTools console
   - Verify TypeScript compiles

4. **Real-time not working**:
   - Check WebSocket connection (DevTools → Network)
   - Verify Realtime enabled in Supabase
   - Check browser privacy mode settings

## 🎯 Next Steps After Verification

Once all checks pass:

1. [ ] Create PR with changes
2. [ ] Deploy to staging
3. [ ] Test on production-like environment
4. [ ] Review documentation with team
5. [ ] Plan integration improvements
6. [ ] Schedule monitoring

## 📝 Sign-Off

- [ ] Builder verified (name: __________ date: ________)
- [ ] Begu tested (name: __________ date: ________)
- [ ] Ready for production (name: __________ date: ________)

---

**Built for my OpenClaw instance** - An AI-powered automation system.

For detailed guides, see:
- QUICKSTART.md - Fast setup
- README.md - Full documentation
- API.md - API reference
- PROACTIVE_INTELLIGENCE.md - System guide
