# Vercel Setup Guide

## Prerequisites
- Vercel account at vercel.com (free hobby tier)
- GitHub repo created with this code pushed

## Step 1 — Install Vercel CLI
```bash
npm install -g vercel@latest
```

## Step 2 — Link the project
```bash
vercel login
vercel link
```
When prompted:
- Set up and deploy → Yes
- Which scope → select your account
- Link to existing project → No (first time)
- Project name → ai-flight-assistant
- Directory → ./

## Step 3 — Create 3 environments in Vercel dashboard
1. Go to your project → Settings → Environments
2. You should see: Production, Preview, Development
3. Rename/alias Preview → Staging (Vercel uses "Preview" for non-production)

## Step 4 — Set environment variables in Vercel
For each environment (Dev / Staging / Production), set these variables:

| Variable | Dev | Staging | Production |
|---|---|---|---|
| NEXT_PUBLIC_ENV | development | staging | production |
| NEXT_PUBLIC_API_URL | https://flight-app-dev.vercel.app | https://flight-app-staging.vercel.app | https://flight-app.vercel.app |
| NEXT_PUBLIC_SUPABASE_URL | (dev project URL) | (staging project URL) | (prod project URL) |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | (dev anon key) | (staging anon key) | (prod anon key) |
| SUPABASE_SERVICE_ROLE_KEY | (dev service role) | (staging service role) | (prod service role) |
| GEMINI_API_KEY | (dev key) | (staging key) | (prod key) |
| AMADEUS_CLIENT_ID | (sandbox id) | (sandbox id) | (prod id) |
| AMADEUS_CLIENT_SECRET | (sandbox secret) | (sandbox secret) | (prod secret) |
| AMADEUS_HOSTNAME | test | test | production |
| HEALTH_CHECK_SECRET | (random string) | (random string) | (random string) |

Generate HEALTH_CHECK_SECRET with: `openssl rand -hex 32`

## Step 5 — Set GitHub Actions secrets
In your GitHub repo → Settings → Secrets and variables → Actions, add:

```
VERCEL_TOKEN          # From vercel.com → Account Settings → Tokens
VERCEL_ORG_ID         # From .vercel/project.json after running vercel link
VERCEL_PROJECT_ID     # From .vercel/project.json after running vercel link
DEV_API_URL
DEV_SUPABASE_URL
DEV_SUPABASE_ANON_KEY
STAGING_API_URL
STAGING_SUPABASE_URL
STAGING_SUPABASE_ANON_KEY
PROD_API_URL
PROD_SUPABASE_URL
PROD_SUPABASE_ANON_KEY
HEALTH_CHECK_SECRET
```

## Step 6 — Set up branch protection rules
In GitHub → Settings → Branches:

For `main`:
- Require a pull request before merging
- Require status checks: lint, typecheck, test, build
- Block direct pushes

For `staging`:
- Require a pull request before merging
- Require status checks: lint, typecheck, test, build

## Step 7 — Create GitHub Environments for manual approval gate
In GitHub → Settings → Environments:
1. Create environment: `staging-to-production-gate`
2. Add required reviewers (yourself)
3. This is what the deploy-staging.yml `await-approval` job waits on

## Step 8 — First deploy
```bash
git init
git add .
git commit -m "feat: initial project scaffold with CI/CD"
git remote add origin https://github.com/YOUR_USERNAME/ai-flight-assistant.git
git push -u origin main
```

The GitHub Actions production workflow will trigger automatically.
