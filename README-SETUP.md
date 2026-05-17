# My Financial Freedom Portal — Setup Guide

## Step 1: Supabase Setup

### A. Run the Database Schema
1. Go to https://supabase.com → your project → SQL Editor
2. Open `supabase-schema.sql` from this folder
3. Run the entire file
4. All tables will be created with RLS disabled

### B. Create Storage Bucket
1. Go to Supabase → Storage → New Bucket
2. Name: `goal-images`
3. Toggle: Public bucket = YES
4. Save

### C. Create Your User Account
Generate a bcrypt hash of your password at https://bcrypt-generator.com (use 12 rounds)
Then run this SQL in Supabase SQL Editor:
```sql
INSERT INTO users (username, password_hash, email, name)
VALUES ('raneesh', 'PASTE_YOUR_HASH_HERE', 'raneesh.mr08@gmail.com', 'Raneesh');
```

---

## Step 2: Vercel Setup

### A. Push to GitHub
1. Create a new GitHub repo (e.g., `ff-portal`)
2. Push this `ff-portal` folder as the repo root:
```bash
cd ff-portal
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ff-portal.git
git push -u origin main
```

### B. Deploy on Vercel
1. Go to vercel.com → New Project → Import from GitHub
2. Select your `ff-portal` repo
3. Framework: Next.js (auto-detected)
4. Add Environment Variables (copy from .env.local):
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - GEMINI_API_KEY
   - RESEND_API_KEY
   - RESEND_TO_EMAIL
   - JWT_SECRET
5. Deploy

### C. Configure Domain at raneesh.net/financial_freedom
Since raneesh.net is already on Vercel:
1. In your NEW project's Vercel settings → Domains → add: `raneesh.net`  
   OR use a rewrite in your existing raneesh.net project.

**Option A (recommended): Separate project with same domain**
- Add `raneesh.net` to the new ff-portal Vercel project
- Set the basePath to `/financial_freedom` in next.config.ts (already done)

**Option B: Rewrite from existing site**
In your existing raneesh.net Vercel project, add to `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/financial_freedom/:path*",
      "destination": "https://YOUR_FF_PORTAL.vercel.app/financial_freedom/:path*"
    }
  ]
}
```

---

## Step 3: Resend Email Setup
1. Go to resend.com → Domains → Add Domain → add your domain `raneesh.net`
2. Add the DNS records they show you
3. Once verified, update the "from" in `app/api/send-summary/route.ts`:
   Change: `from: 'Financial Freedom <onboarding@resend.dev>'`
   To: `from: 'Financial Freedom <noreply@raneesh.net>'`

Until then, Resend's test domain `onboarding@resend.dev` works for sending to your own email.

---

## Step 4: First Login
Visit `www.raneesh.net/financial_freedom/login`
- Username: `raneesh` (or whatever you set in SQL)
- Password: whatever you hashed

---

## Features Built
- ✅ Login with JWT session (7-day)
- ✅ Dashboard: portfolio value, goal progress, streak, payments
- ✅ Goals: image upload, compounding projections, edit history
- ✅ Investments: XIRR, time-in-market, projections, type notes
- ✅ Payments: freedom cost, essential/discretionary split, mark as paid
- ✅ Money Mind: all 18 psychological traps with progress tracking
- ✅ Discover AI: Gemini 1.5 Flash analysis with 4-section insights
- ✅ Email Summary: beautiful HTML email via Resend
- ✅ Settings: income profile, My Game, live currency rate
- ✅ Mobile-first: bottom nav on mobile, sidebar on desktop
- ✅ Live AED↔INR rate: auto-fetches from Frankfurter API
- ✅ Wealth-attracting UI: deep navy + gold design
