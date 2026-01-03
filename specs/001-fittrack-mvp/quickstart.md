# Quickstart: FitTrack Pro MVP

**Branch**: `001-fittrack-mvp` | **Date**: 2026-01-03

This guide walks through setting up and running FitTrack Pro MVP locally.

---

## Prerequisites

- **Node.js** 20.x or later
- **pnpm** 8.x or later (recommended) or npm
- **Git** for version control
- **Clerk Account** for authentication
- **Neon Account** for database
- **OpenAI-compatible API** (LiteLLM, OpenAI, etc.)

---

## 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd workout-tracker

# Install dependencies
pnpm install
```

---

## 2. Environment Setup

Create `.env.local` file in the project root:

```bash
# Copy example env file
cp .env.example .env.local
```

Fill in the required values:

```env
# ============ Clerk Authentication ============
# Get from: https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Clerk redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/profile

# ============ Neon Database ============
# Get from: https://console.neon.tech
# Format: postgresql://user:password@endpoint/database?sslmode=require
DATABASE_URL=postgresql://xxx:xxx@xxx.neon.tech/fittrack?sslmode=require

# ============ AI / LiteLLM ============
# For LiteLLM proxy:
LITELLM_API_BASE=https://your-litellm-proxy.com/v1
LITELLM_API_KEY=sk-xxx

# Or for direct OpenAI:
# LITELLM_API_BASE=https://api.openai.com/v1
# LITELLM_API_KEY=sk-xxx

# ============ App Configuration ============
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 3. Database Setup

### Create Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project named "fittrack"
3. Copy the connection string to `DATABASE_URL`

### Run Migrations

```bash
# Generate migration files from schema
pnpm db:generate

# Apply migrations to database
pnpm db:push

# Seed exercise library (50+ exercises)
pnpm db:seed
```

### Database Commands Reference

```bash
pnpm db:generate    # Generate migrations from schema changes
pnpm db:push        # Push schema to database (dev)
pnpm db:migrate     # Run migrations (production)
pnpm db:seed        # Seed exercise library
pnpm db:studio      # Open Drizzle Studio GUI
```

---

## 4. Clerk Setup

### Create Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application named "FitTrack Pro"
3. Enable **Email** sign-in method
4. Copy API keys to `.env.local`

### Configure Clerk Theme

In Clerk Dashboard → Customization:

1. Set **Primary color** to `#667eea`
2. Enable **Dark mode**
3. Set **Background** to `#000000`

### Configure Webhooks (Optional)

For syncing user data to database:

1. Add webhook endpoint: `https://your-domain.com/api/webhooks/clerk`
2. Subscribe to events: `user.created`, `user.updated`, `user.deleted`

---

## 5. Install shadcn/ui Components

Initialize shadcn/ui (if not already done):

```bash
pnpm dlx shadcn@latest init
```

Use this configuration:
- Style: **default**
- Base color: **zinc**
- CSS variables: **yes**
- Tailwind config: **tailwind.config.ts**
- Components path: **src/components**
- Utils path: **src/lib/utils**

Install required components:

```bash
pnpm dlx shadcn@latest add button card input dialog dropdown-menu tabs progress avatar badge calendar toast
```

---

## 6. Run Development Server

```bash
# Start development server
pnpm dev

# Or with specific host/port
pnpm dev --host 192.168.1.101 --port 3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Verify Installation

### Check PWA

1. Open DevTools → Application → Manifest
2. Verify manifest loads correctly
3. Check Service Worker is registered

### Check Auth Flow

1. Navigate to `/sign-up`
2. Create test account
3. Verify redirect to `/profile` for onboarding

### Check Database Connection

1. Navigate to `/profile` (authenticated)
2. Update equipment preferences
3. Verify data persists on refresh

### Check AI Integration

1. Set equipment preferences
2. Navigate to `/plans/generate`
3. Generate a workout plan
4. Verify response within 10 seconds

---

## 8. Development Workflow

### File Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components
│   ├── workout/        # Workout components
│   ├── exercise/       # Exercise components
│   └── dashboard/      # Dashboard components
├── lib/
│   ├── db/             # Drizzle ORM
│   ├── ai/             # LiteLLM client
│   └── utils.ts        # Utilities
├── hooks/              # React hooks
└── types/              # TypeScript types
```

### Common Tasks

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Run Prettier
pnpm type-check       # TypeScript check

# Testing
pnpm test             # Run Vitest
pnpm test:e2e         # Run Playwright E2E tests
pnpm test:coverage    # Run with coverage

# Database
pnpm db:studio        # Open Drizzle Studio
pnpm db:push          # Push schema changes
```

---

## 9. PWA Testing

### Test Installability

1. Open Chrome DevTools → Lighthouse
2. Run PWA audit
3. Target score: 90+

### Test Offline Mode

1. Open DevTools → Network → Offline
2. Start a workout
3. Complete and log workout
4. Go online
5. Verify sync occurs

### Test on Mobile

1. Deploy to Vercel (preview)
2. Open on mobile device
3. Tap "Add to Home Screen"
4. Launch from home screen
5. Verify standalone mode

---

## 10. Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
pnpm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

### Environment Variables on Vercel

Add all `.env.local` variables to Vercel project settings:

1. Go to Project → Settings → Environment Variables
2. Add each variable for Production & Preview
3. Redeploy after adding variables

### Database Migrations on Deploy

Add to `package.json` build script:

```json
{
  "scripts": {
    "build": "pnpm db:migrate && next build"
  }
}
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Clerk 401 errors | Check API keys match environment |
| Database connection fails | Verify `DATABASE_URL` includes `?sslmode=require` |
| AI generation timeout | Increase timeout, check `LITELLM_API_BASE` |
| PWA not installing | Check manifest.ts and HTTPS requirement |
| Service worker not updating | Clear cache, unregister old SW |

### Debug Mode

Enable verbose logging:

```env
# Add to .env.local
DEBUG=true
```

### Reset Database

```bash
# Drop all tables and re-migrate
pnpm db:push --force

# Re-seed exercises
pnpm db:seed
```

---

## Next Steps

1. ✅ Environment configured
2. ✅ Database connected
3. ✅ Auth working
4. → Start implementing features per `/specs/001-fittrack-mvp/tasks.md`
