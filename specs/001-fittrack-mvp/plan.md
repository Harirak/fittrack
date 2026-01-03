# Implementation Plan: FitTrack Pro MVP

**Branch**: `001-fittrack-mvp` | **Date**: 2026-01-03 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-fittrack-mvp/spec.md`

## Summary

FitTrack Pro MVP is a Progressive Web App for fitness tracking with three core capabilities:
1. **Treadmill workout tracking** with timer, distance, speed, and calorie estimation
2. **Equipment-based exercise library** filtered by user's home gym equipment (dumbbells, barbells, kettlebells)
3. **AI-powered workout plan generation** using LiteLLM with OpenAI-compatible endpoints

Technical approach: Next.js 15 App Router with shadcn/ui components, Clerk authentication, Neon serverless Postgres with Drizzle ORM, deployed on Vercel as an installable PWA.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)  
**Framework**: Next.js 15.x (App Router, Server Components, Server Actions)  
**Primary Dependencies**: 
- `@clerk/nextjs` (authentication)
- `@neondatabase/serverless` + `drizzle-orm` (database)
- `shadcn/ui` + `tailwindcss` (UI components)
- `litellm` or direct OpenAI SDK (AI generation)
- `lucide-react` (icons)

**Storage**: Neon Serverless Postgres  
**Testing**: Vitest (unit/integration), Playwright (E2E)  
**Target Platform**: Mobile browsers (iOS Safari, Android Chrome) as PWA  
**Project Type**: Web application (single Next.js project)  
**Performance Goals**: 
- LCP < 2.5s, FID < 100ms, CLS < 0.1 (Core Web Vitals)
- Lighthouse PWA score ≥ 90
- AI response < 10s

**Constraints**: 
- Offline-capable for workout logging
- Mobile-first responsive design
- 44px minimum touch targets

**Scale/Scope**: MVP targeting individual users, ~5 main screens, 50+ exercises in library

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. PWA-First Mobile Experience | ✅ PASS | PWA requirements FR-029/030/031, SC-010 Lighthouse target |
| II. Dark Gradient Design System | ✅ PASS | Using shadcn/ui with custom Tailwind config per constitution |
| III. Authentication & User Management | ✅ PASS | Clerk integration specified, FR-001 through FR-004 |
| IV. Serverless Database Architecture | ✅ PASS | Neon + Drizzle ORM per constitution |
| V. AI-Powered Workout Generation | ✅ PASS | LiteLLM integration, FR-020 through FR-024e |
| VI. Test-First Development | ✅ PASS | Vitest + Playwright tooling specified |
| VII. Simplicity & Progressive Enhancement | ✅ PASS | MVP-first approach with 6 prioritized user stories |

**Gate Status**: ✅ PASSED - All constitution principles aligned

## Project Structure

### Documentation (this feature)

```text
specs/001-fittrack-mvp/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
│   └── api.yaml
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Bottom nav layout
│   │   ├── page.tsx             # Home/Dashboard
│   │   ├── workouts/
│   │   │   ├── page.tsx         # Workout history
│   │   │   ├── new/page.tsx     # Start workout
│   │   │   └── [id]/page.tsx    # Workout detail
│   │   ├── exercises/
│   │   │   ├── page.tsx         # Exercise library
│   │   │   └── [id]/page.tsx    # Exercise detail
│   │   ├── plans/
│   │   │   ├── page.tsx         # My saved plans
│   │   │   ├── generate/page.tsx # AI generation
│   │   │   └── [id]/page.tsx    # Plan detail/start
│   │   └── profile/
│   │       └── page.tsx         # Settings & equipment
│   ├── api/
│   │   ├── workouts/
│   │   │   └── route.ts
│   │   ├── exercises/
│   │   │   └── route.ts
│   │   └── ai/
│   │       └── generate/route.ts
│   ├── layout.tsx
│   ├── globals.css
│   └── manifest.ts              # PWA manifest
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── layout/
│   │   ├── BottomNav.tsx
│   │   ├── Header.tsx
│   │   └── MobileContainer.tsx
│   ├── workout/
│   │   ├── ActivityRing.tsx
│   │   ├── WorkoutCard.tsx
│   │   ├── WorkoutTimer.tsx
│   │   ├── TreadmillForm.tsx
│   │   └── StrengthLogForm.tsx
│   ├── exercise/
│   │   ├── ExerciseCard.tsx
│   │   ├── ExerciseFilters.tsx
│   │   └── ExerciseDetail.tsx
│   ├── plan/
│   │   ├── PlanCard.tsx
│   │   ├── GenerateForm.tsx
│   │   └── WorkoutGuide.tsx
│   └── dashboard/
│       ├── StatsCard.tsx
│       ├── WeeklyChart.tsx
│       └── GoalProgress.tsx
├── lib/
│   ├── db/
│   │   ├── index.ts             # Drizzle client (singleton)
│   │   ├── schema.ts            # Database schema
│   │   └── migrations/
│   ├── ai/
│   │   ├── client.ts            # LiteLLM/OpenAI client
│   │   └── prompts/
│   │       └── workout-generation.ts
│   ├── utils.ts                 # cn() and helpers
│   ├── validations.ts           # Zod schemas
│   └── constants.ts             # App constants
├── hooks/
│   ├── useWorkoutTimer.ts
│   ├── useOfflineSync.ts
│   └── useActivityGoals.ts
├── types/
│   └── index.ts
└── middleware.ts                # Clerk auth middleware

public/
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── apple-touch-icon.png
├── sw.js                        # Service worker
└── offline.html

tests/
├── unit/
│   ├── lib/
│   └── components/
├── integration/
│   └── api/
└── e2e/
    ├── auth.spec.ts
    ├── workout.spec.ts
    └── ai-generation.spec.ts
```

**Structure Decision**: Single Next.js 15 project using App Router with Server Components. All features colocated in `src/` with clear separation between UI components, data layer, and API routes. PWA assets in `public/`.

## Complexity Tracking

> No constitution violations requiring justification. All patterns align with principles.

| Pattern | Justification | Simpler Alternative |
|---------|---------------|---------------------|
| Service Worker for offline | Required by FR-011, FR-030 | N/A - PWA requirement |
| LiteLLM integration | Required by constitution Principle V | Direct OpenAI SDK (less flexible) |
| Drizzle ORM | Type-safety per constitution Principle IV | Raw SQL (less maintainable) |
