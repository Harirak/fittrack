# FitTrack Pro MVP

A Progressive Web App for fitness tracking with AI-powered workout plan generation.

## Features

- **Treadmill Workout Logging**: Track running/walking workouts with timer, distance, speed, and calorie estimation
- **Equipment-Based Exercise Library**: Browse 50+ exercises filtered by your available home gym equipment
- **AI-Powered Workout Plans**: Generate personalized workout plans using OpenAI-compatible APIs
- **Workout History**: View all logged workouts with detailed statistics
- **Progress Dashboard**: Track your fitness journey with activity rings and weekly charts
- **Offline Support**: Log workouts offline and sync when connectivity is restored
- **Dark Gradient Theme**: Modern dark interface with purple/violet gradients

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Database**: [Neon](https://neon.tech/) Serverless Postgres with [Drizzle ORM](https://orm.drizzle.team/)
- **AI**: OpenAI SDK (compatible with LiteLLM)
- **PWA**: Service Worker with IndexedDB for offline storage

## Prerequisites

- Node.js 20.x or later
- pnpm 8.x or later (or npm/yarn)
- Clerk account for authentication
- Neon account for database
- OpenAI-compatible API for AI features

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd workout-tracker
pnpm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret

# Neon Database
DATABASE_URL=postgresql://user:password@hostname/database?sslmode=require

# AI / OpenAI
OPENAI_API_KEY=your_api_key
LITELLM_API_URL=https://your-litellm-instance.com/v1

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Generate and apply migrations
pnpm db:push

# Seed exercise library
pnpm db:seed
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected app pages
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── workout/          # Workout-related components
│   ├── exercise/         # Exercise-related components
│   ├── plan/             # Workout plan components
│   └── dashboard/        # Dashboard components
├── lib/                   # Utilities and libraries
│   ├── db/              # Database setup and queries
│   ├── ai/              # AI client and prompts
│   ├── offline/         # Offline storage
│   ├── validations.ts   # Zod schemas
│   ├── constants.ts     # App constants
│   └── utils.ts         # Utility functions
├── hooks/                # React hooks
└── types/                # TypeScript types
```

## Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type check

# Database
pnpm db:generate      # Generate migrations
pnpm db:push          # Push schema to database
pnpm db:studio        # Open Drizzle Studio
pnpm db:seed          # Seed exercise library
```

## API Routes

### Authentication
- `GET/POST /api/webhooks/clerk` - Clerk webhooks for user sync

### Workouts
- `GET /api/workouts` - List user workouts
- `POST /api/workouts/treadmill` - Log treadmill workout
- `POST /api/workouts/strength` - Log strength workout
- `GET /api/workouts/[id]` - Get workout details
- `POST /api/workouts/sync` - Sync offline workouts

### Exercises
- `GET /api/exercises` - List exercises with filters
- `GET /api/exercises/[id]` - Get exercise details

### Plans
- `GET /api/plans` - List saved workout plans
- `POST /api/plans` - Save workout plan
- `GET/DELETE /api/plans/[id]` - Manage plan

### AI Generation
- `POST /api/ai/generate` - Generate AI workout plan
- `GET /api/ai/generate` - Check AI service availability

### User
- `GET/PATCH /api/user/profile` - User profile
- `GET/PUT /api/user/equipment` - Equipment preferences
- `GET/PUT /api/user/goals` - Activity goals

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/weekly` - Weekly breakdown
- `GET /api/dashboard/progress` - Goal progress

## Database Schema

### Core Tables
- `users` - User profiles synced with Clerk
- `equipment_profiles` - User equipment preferences
- `workouts` - Base workout records
- `treadmill_data` - Treadmill workout details
- `strength_workout_data` - Strength workout details
- `exercises` - Exercise library (seeded)
- `workout_plans` - Saved workout plans
- `activity_goals` - User fitness goals

See `specs/001-fittrack-mvp/data-model.md` for full schema details.

## PWA Features

### Installation
The app is installable as a Progressive Web App on mobile devices:
1. Open the app in a mobile browser
2. Tap "Add to Home Screen"
3. Launch from home screen in standalone mode

### Offline Support
- Workouts can be logged offline
- Data is stored in IndexedDB
- Automatic sync when connectivity is restored
- Offline indicator in UI

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint for linting
- Conventional commits for git messages

### Testing
```bash
# Unit tests (Vitest)
pnpm test

# E2E tests (Playwright)
pnpm test:e2e

# Coverage
pnpm test:coverage
```

### Component Development
- Use shadcn/ui components as base
- Follow mobile-first design
- Ensure 44px minimum touch targets
- Test dark mode appearance

## Deployment

### Vercel
The app is configured for deployment on Vercel:

```bash
vercel
```

Add environment variables in Vercel project settings before deploying.

### Environment Variables for Production
Ensure all variables from `.env.example` are set in your production environment.

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` includes `?sslmode=require`
- Check Neon console for database status
- Run `pnpm db:push` to sync schema

### Authentication Errors
- Verify Clerk keys match environment
- Check Clerk dashboard for app status
- Ensure redirect URLs are configured

### AI Generation Timeout
- Increase timeout in API route
- Verify `LITELLM_API_URL` is accessible
- Check API key validity

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Support

For issues and questions:
- Open an issue on GitHub
- Check documentation in `/specs/001-fittrack-mvp/`
