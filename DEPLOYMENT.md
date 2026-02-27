# Sportsphere — Deployment Guide

This guide walks through deploying Sportsphere on **Supabase Cloud** (database + auth + edge functions) and **Vercel** (frontend hosting). After setup, every `git push` auto-deploys to your live URL.

---

## Prerequisites

- [Node.js 18+](https://nodejs.org)
- [Supabase CLI](https://supabase.com/docs/guides/cli): `npm install -g supabase`
- [Vercel CLI](https://vercel.com/docs/cli) (optional): `npm install -g vercel`
- A GitHub account (for Vercel auto-deploy)

---

## Step 1 — Create Supabase Cloud Project

1. Go to [supabase.com](https://supabase.com) and sign up / log in
2. Click **New Project**, choose a name (e.g. `sportsphere`) and a strong database password
3. Wait ~2 minutes for provisioning
4. Go to **Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`
   - **service_role key** → needed for edge functions (keep secret)

---

## Step 2 — Apply Database Migrations

Link your local repo to the cloud project and push the schema:

```bash
# From the sportsphere-main/ directory (where package.json lives)
supabase login
supabase link --project-ref <your-project-ref>
# Project ref is in Settings → General (e.g. abcdefghijklmnop)

supabase db push
# This runs supabase/migrations/0001_initial_schema.sql on your cloud DB
```

Verify in the Supabase Dashboard → **Table Editor** that tables like `profiles`, `organizations`, `training_sessions` etc. were created.

---

## Step 3 — Configure Supabase Auth

### Enable OAuth providers (optional but recommended)

In Supabase Dashboard → **Authentication → Providers**:

**Google:**
1. Create OAuth credentials at [console.cloud.google.com](https://console.cloud.google.com)
2. Add authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. Paste Client ID and Secret into Supabase

**GitHub:**
1. Create OAuth app at [github.com/settings/developers](https://github.com/settings/developers)
2. Callback URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. Paste Client ID and Secret into Supabase

### Set site URL

In **Authentication → URL Configuration**:
- Site URL: `https://sportsphere.vercel.app` (update after Vercel deploy)
- Additional redirect URLs: `http://localhost:5173` (for local dev)

---

## Step 4 — Deploy Edge Functions

### Set Edge Function secrets

In Supabase Dashboard → **Edge Functions → Secrets**, add:

| Secret | Where to get it |
|--------|----------------|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `RESEND_API_KEY` | [resend.com](https://resend.com) (free: 3k emails/month) |
| `STRIPE_SECRET_KEY` | [dashboard.stripe.com](https://dashboard.stripe.com) → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Created when you add the webhook endpoint (Step 6) |
| `YOUTUBE_API_KEY` | [console.cloud.google.com](https://console.cloud.google.com) → YouTube Data API v3 |
| `MUX_TOKEN_ID` | [dashboard.mux.com](https://dashboard.mux.com) → Settings → API keys (optional) |
| `MUX_TOKEN_SECRET` | Same as above (optional) |

### Deploy all functions

```bash
supabase functions deploy
# Deploys all functions in supabase/functions/*/index.ts
```

Or deploy individually:
```bash
supabase functions deploy invoke-llm
supabase functions deploy send-email
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
# etc.
```

---

## Step 5 — Deploy Frontend to Vercel

### Option A: Via Vercel Dashboard (recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import from GitHub
3. Select your repo
4. Set **Root Directory** to `sportsphere-main` (the folder containing `package.json`)
5. Framework preset: **Vite** (auto-detected)
6. Add Environment Variables:
   ```
   VITE_SUPABASE_URL     = https://<your-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJ...
   ```
7. Click **Deploy**

Your app will be live at `https://sportsphere-<hash>.vercel.app` (you can set a custom domain).

### Option B: Via Vercel CLI

```bash
cd sportsphere-main
vercel
# Follow prompts, set env vars when asked
```

---

## Step 6 — Configure Stripe Webhook (for payments)

1. In [Stripe Dashboard](https://dashboard.stripe.com) → **Developers → Webhooks** → **Add endpoint**
2. Endpoint URL: `https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
4. Copy the **Signing secret** and add it as `STRIPE_WEBHOOK_SECRET` in Supabase Edge Function secrets
5. Re-deploy the stripe-webhook function: `supabase functions deploy stripe-webhook`

---

## Step 7 — Local Development

```bash
cd sportsphere-main

# Copy env template
cp .env.example .env
# Fill in your Supabase URL and anon key in .env

npm install
npm run dev
# App runs at http://localhost:5173
```

For local Supabase (optional — uses Docker):
```bash
supabase start
# Local dashboard at http://localhost:54323
# Local API at http://localhost:54321
```

---

## Deployment Workflow (after initial setup)

```
git add .
git commit -m "feat: my change"
git push origin main
# → Vercel auto-deploys frontend in ~2 minutes
# → Live URL updates automatically
```

For edge function changes:
```bash
supabase functions deploy <function-name>
```

For DB schema changes:
```bash
# Create a new migration file
supabase migration new my_change
# Edit supabase/migrations/<timestamp>_my_change.sql
supabase db push
```

---

## Environment Variables Reference

### Frontend (Vercel env vars — prefix with `VITE_`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |

### Backend (Supabase Edge Function secrets)

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | For AI features (coach, moderation, summaries) |
| `RESEND_API_KEY` | For emails | Transactional email (notifications, invites) |
| `STRIPE_SECRET_KEY` | For payments | Premium subscriptions, tips, PPV |
| `STRIPE_WEBHOOK_SECRET` | For payments | Stripe webhook signature verification |
| `YOUTUBE_API_KEY` | For video import | YouTube search/embed in ImportVideos page |
| `MUX_TOKEN_ID` | For video processing | Video transcoding (graceful fallback if missing) |
| `MUX_TOKEN_SECRET` | For video processing | Mux API secret |

---

## Architecture Overview

```
GitHub Repo
  ├── git push → Vercel (auto-deploy in ~2 min)
  │              React/Vite SPA at https://sportsphere.vercel.app
  │              Uses VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
  │
  └── supabase CLI → Supabase Cloud
                     ├── PostgreSQL DB (RLS multi-tenancy)
                     ├── Auth (magic link + Google + GitHub OAuth)
                     ├── Storage bucket: uploads (avatars, videos, images)
                     ├── Realtime (live chat, notifications)
                     └── Edge Functions (16 functions)
                         ├── invoke-llm       → Anthropic Claude
                         ├── send-email       → Resend
                         ├── create-checkout  → Stripe
                         ├── stripe-webhook   → Stripe
                         ├── export-ical      → RFC .ics generation
                         ├── moderate-content → Claude moderation
                         ├── analyze-chat     → Claude chat analysis
                         ├── analyze-behavior → Claude recommendations
                         ├── stream-summary   → Claude summaries
                         ├── highlight-clips  → Claude clip suggestions
                         ├── process-video    → Mux API
                         ├── fetch-videos     → YouTube API
                         ├── notify           → Resend + DB
                         ├── notify-streams   → Scheduled notifications
                         ├── moderate-message → Claude moderation
                         └── ai-agent         → Claude conversation
```

---

## Troubleshooting

**Build fails on Vercel:**
- Check that Root Directory is set to `sportsphere-main` (not the outer folder)
- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel env vars

**Auth redirect loop:**
- Make sure your Vercel domain is in Supabase → Authentication → URL Configuration → Additional redirect URLs

**Edge Function 401/403:**
- Edge functions use the service_role key internally — make sure secrets are set in Supabase dashboard, not in `.env`

**Database migration fails:**
- Run `supabase db push --dry-run` first to preview
- Check Supabase Dashboard → Logs for detailed error messages

**OAuth not working:**
- Verify the callback URL in your OAuth provider exactly matches `https://<project-ref>.supabase.co/auth/v1/callback`
