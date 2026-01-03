# Research: FitTrack Pro MVP

**Branch**: `001-fittrack-mvp` | **Date**: 2026-01-03

## Overview

This document consolidates research findings for implementing FitTrack Pro MVP. All technology choices align with the project constitution v1.1.0.

---

## 1. Next.js 15 PWA Implementation

### Decision
Use Next.js 15's native PWA support with custom service worker in `public/sw.js` and manifest via `app/manifest.ts`.

### Rationale
- Next.js 15 has official PWA support reducing need for `next-pwa` library
- App Router's `manifest.ts` generates Web App Manifest dynamically
- Service worker can be handcrafted for precise caching control needed for offline workout logging

### Implementation Pattern
```typescript
// app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FitTrack Pro',
    short_name: 'FitTrack',
    description: 'Track your workouts and get AI-powered fitness plans',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#667eea',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
```

### Alternatives Considered
- `next-pwa` package: More automated but adds dependency and less control
- Serwist: Good alternative but Next.js 15 native approach preferred for simplicity

---

## 2. Clerk Authentication with Next.js 15

### Decision
Use `@clerk/nextjs` with `clerkMiddleware()` for edge-based route protection.

### Rationale
- Clerk provides pre-built UI components matching dark theme requirements
- Edge middleware ensures auth check before any route processing
- User metadata API perfect for storing fitness level, equipment preferences

### Implementation Pattern
```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

### User Metadata Structure
```typescript
interface ClerkUserMetadata {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  equipment: ('dumbbells' | 'barbells' | 'kettlebells' | 'bodyweight')[];
  unitPreference: 'metric' | 'imperial';
  weight?: number; // in kg or lbs based on preference
  dailyGoal: { duration: number; distance: number; workouts: number };
  weeklyGoal: { duration: number; distance: number; workouts: number };
}
```

### Alternatives Considered
- NextAuth.js: More setup required, no built-in UI components
- Supabase Auth: Good but constitution mandates Clerk

---

## 3. Neon Serverless Postgres with Drizzle ORM

### Decision
Use `@neondatabase/serverless` driver with Drizzle ORM in singleton pattern.

### Rationale
- Neon's HTTP-based driver ideal for serverless/edge functions
- Drizzle provides type-safe queries with minimal overhead
- Singleton pattern prevents connection pool exhaustion in serverless

### Implementation Pattern
```typescript
// lib/db/index.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### Migration Strategy
```bash
# Generate migration
npx drizzle-kit generate

# Push to database
npx drizzle-kit push

# For production: use drizzle-kit migrate
```

### Alternatives Considered
- Prisma: Heavier, slower cold starts in serverless
- Raw SQL: No type safety, harder to maintain

---

## 4. LiteLLM AI Integration

### Decision
Use LiteLLM SDK directly for OpenAI-compatible API calls with structured output for workout generation.

### Rationale
- LiteLLM unifies multiple AI providers under OpenAI-compatible interface
- Structured JSON output ensures consistent workout plan format
- Easy to switch providers by changing model name

### Implementation Pattern
```typescript
// lib/ai/client.ts
import OpenAI from 'openai';

export const aiClient = new OpenAI({
  baseURL: process.env.LITELLM_API_BASE,
  apiKey: process.env.LITELLM_API_KEY,
});

// lib/ai/prompts/workout-generation.ts
export const generateWorkoutPrompt = (params: {
  goal: 'build_muscle' | 'lose_weight' | 'general_fitness';
  equipment: string[];
  fitnessLevel: string;
  durationMinutes: number;
  availableExercises: string[];
}) => `Generate a ${params.durationMinutes}-minute ${params.goal.replace('_', ' ')} workout...`;
```

### Response Schema
```typescript
interface AIWorkoutPlan {
  name: string;
  estimatedDuration: number;
  exercises: {
    exerciseId: string;
    sets: number;
    reps: number | string; // "12" or "8-12" or "30 seconds"
    restSeconds: number;
    notes?: string;
  }[];
  warmup?: string;
  cooldown?: string;
}
```

### Rate Limiting Strategy
- User-level: 10 AI generations per day (stored in user metadata)
- Request timeout: 30 seconds
- Fallback: Show exercise library on failure

### Alternatives Considered
- Direct OpenAI SDK: Less flexible for provider switching
- Langchain: Overkill for single-prompt generation

---

## 5. Offline Workout Sync Strategy

### Decision
Use IndexedDB for offline storage with background sync when connectivity restores.

### Rationale
- IndexedDB provides persistent storage for workout data
- Service Worker's Background Sync API handles reconnection
- Simple queue-based approach for pending syncs

### Implementation Pattern
```typescript
// lib/offline/storage.ts
import { openDB } from 'idb';

export const db = openDB('fittrack', 1, {
  upgrade(db) {
    db.createObjectStore('pendingWorkouts', { keyPath: 'localId' });
    db.createObjectStore('cachedExercises', { keyPath: 'id' });
  },
});

// Save workout offline
export async function saveWorkoutOffline(workout: PendingWorkout) {
  const database = await db;
  await database.put('pendingWorkouts', workout);
  
  // Register sync if supported
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('sync-workouts');
  }
}
```

### Sync Strategy
1. User completes workout offline → Save to IndexedDB with `synced: false`
2. Show workout in history with "Pending sync" badge
3. On connectivity: Background Sync triggers → POST to API
4. On success: Remove from IndexedDB, update UI
5. On failure: Retry with exponential backoff

### Alternatives Considered
- localStorage: Size limited, no structured queries
- PouchDB/CouchDB: Overkill for simple sync needs

---

## 6. Exercise Library Data Structure

### Decision
Seed database with curated exercise library; allow admin expansion post-MVP.

### Rationale
- 50+ exercises needed per FR-016
- Static seed data ensures consistent starting point
- Categories: muscle group, equipment, difficulty

### Exercise Categories
```typescript
const muscleGroups = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 
  'core', 'quadriceps', 'hamstrings', 'glutes', 'calves'
] as const;

const equipmentTypes = [
  'bodyweight', 'dumbbells', 'barbells', 'kettlebells'
] as const;

const difficultyLevels = ['beginner', 'intermediate', 'advanced'] as const;
```

### Seed Data Example
```typescript
const exercises = [
  {
    id: 'dumbbell-bench-press',
    name: 'Dumbbell Bench Press',
    description: 'Lie on a flat bench...',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    equipment: 'dumbbells',
    difficulty: 'beginner',
    instructions: '1. Lie flat on bench...',
  },
  // ... 49+ more exercises
];
```

---

## 7. Activity Ring Implementation

### Decision
Custom SVG-based circular progress component with CSS animations.

### Rationale
- Full control over gradient strokes matching design system
- No external charting library needed for simple rings
- Smooth animations via CSS transitions

### Implementation Pattern
```tsx
// components/workout/ActivityRing.tsx
interface ActivityRingProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  gradient?: 'primary' | 'accent' | 'success';
  label?: string;
  value?: string;
}

const GRADIENTS = {
  primary: ['#667eea', '#764ba2'],
  accent: ['#f093fb', '#f5576c'],
  success: ['#4facfe', '#00f2fe'],
};

// SVG circle with stroke-dasharray animation
```

---

## 8. Calorie Estimation Formula

### Decision
Use MET (Metabolic Equivalent of Task) formula for treadmill calorie estimation.

### Rationale
- Industry-standard approach
- Requires only duration, speed, and optional weight
- Accurate enough for fitness tracking purposes

### Formula
```typescript
function estimateCalories(params: {
  durationMinutes: number;
  speedKmh: number;
  weightKg: number; // default 70kg if not provided
}): number {
  // MET values for running/walking
  const met = getMETForSpeed(params.speedKmh);
  // Calories = MET × weight(kg) × duration(hours)
  return met * params.weightKg * (params.durationMinutes / 60);
}

function getMETForSpeed(speedKmh: number): number {
  if (speedKmh < 5) return 3.5;      // Slow walk
  if (speedKmh < 6.5) return 4.3;    // Moderate walk
  if (speedKmh < 8) return 7.0;      // Fast walk/light jog
  if (speedKmh < 10) return 8.3;     // Jogging
  if (speedKmh < 12) return 9.8;     // Running
  if (speedKmh < 14) return 11.0;    // Fast running
  return 12.8;                        // Very fast running
}
```

---

## 9. shadcn/ui Component Customization

### Decision
Install core shadcn/ui components and create custom variants for dark gradient theme.

### Components to Install
```bash
npx shadcn@latest add button card input dialog dropdown-menu tabs progress avatar badge calendar toast
```

### Custom Button Variants
```typescript
// Extend buttonVariants with gradient options
const buttonVariants = cva(
  "...",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-white hover:opacity-90",
        secondary: "bg-muted text-white hover:bg-muted/80",
        outline: "border border-border bg-transparent hover:bg-muted",
        ghost: "hover:bg-muted",
        gradient: "bg-gradient-accent text-white",
      },
    },
  }
);
```

---

## Summary of Technology Decisions

| Area | Decision | Key Dependency |
|------|----------|----------------|
| PWA | Native Next.js 15 support | `app/manifest.ts` + `public/sw.js` |
| Auth | Clerk with edge middleware | `@clerk/nextjs` |
| Database | Neon serverless + Drizzle | `@neondatabase/serverless`, `drizzle-orm` |
| AI | LiteLLM via OpenAI SDK | `openai` (configured for LiteLLM) |
| Offline | IndexedDB + Background Sync | `idb` |
| UI | shadcn/ui + custom gradients | `shadcn/ui`, `tailwindcss` |
| Charts | Custom SVG activity rings | None (custom implementation) |
| Testing | Vitest + Playwright | `vitest`, `@playwright/test` |

All decisions align with constitution principles and enable MVP delivery.
