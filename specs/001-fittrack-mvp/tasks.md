# Tasks: FitTrack Pro MVP

**Input**: Design documents from `/specs/001-fittrack-mvp/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are recommended per constitution (Principle VI) but not blocking. Include E2E tests for critical paths.

**Organization**: Tasks grouped by user story (P1 → P2 → P3) to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, etc.)
- Paths use `src/` (single Next.js 15 project structure)

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize Next.js 15 project with all dependencies and configuration

- [X] T001 Initialize Next.js 15 project with TypeScript, App Router, and Tailwind CSS using `npx create-next-app@latest ./ --typescript --tailwind --app --eslint`
- [X] T002 [P] Configure `package.json` with all dependencies: `@clerk/nextjs`, `@neondatabase/serverless`, `drizzle-orm`, `openai`, `lucide-react`, `zod`, `idb`
- [X] T003 [P] Configure `tsconfig.json` with strict mode and path aliases (`@/`)
- [X] T004 [P] Configure `tailwind.config.ts` with dark gradient theme colors per constitution (brand purple/violet/pink/coral/cyan)
- [X] T005 [P] Create `src/app/globals.css` with CSS variables for gradients and shadcn/ui base styles
- [X] T006 Initialize shadcn/ui with `npx shadcn@latest init` using zinc base color and CSS variables
- [X] T007 [P] Install shadcn/ui components: button, card, input, dialog, dropdown-menu, tabs, progress, avatar, badge, calendar, toast
- [X] T008 [P] Create `.env.example` with all required environment variables (Clerk, Neon, LiteLLM, App URL)
- [X] T009 [P] Create `src/lib/utils.ts` with cn() helper function for Tailwind class merging
- [X] T010 [P] Create `src/types/index.ts` with core TypeScript types and interfaces

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & ORM Setup

- [X] T011 Create `src/lib/db/index.ts` with Drizzle client singleton using Neon serverless driver
- [X] T012 Create `src/lib/db/schema.ts` with all database tables: users, equipment_profiles, workouts, treadmill_data, strength_workout_data, exercises, workout_plans, activity_goals (per data-model.md)
- [X] T013 [P] Create `drizzle.config.ts` with Neon connection configuration
- [ ] T014 Run `npx drizzle-kit generate` to generate initial migrations
- [ ] T015 Run `npx drizzle-kit push` to apply schema to Neon database

### Authentication Infrastructure

- [X] T016 Create `src/middleware.ts` with Clerk authentication middleware using `clerkMiddleware()` and route matchers
- [X] T017 [P] Create `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` with Clerk SignIn component
- [X] T018 [P] Create `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` with Clerk SignUp component
- [X] T019 Create `src/app/(auth)/layout.tsx` with centered auth layout for sign-in/sign-up pages

### Layout & Navigation

- [X] T020 Create `src/app/layout.tsx` with ClerkProvider, Inter font, and dark theme body
- [X] T021 Create `src/components/layout/MobileContainer.tsx` with max-width constraint and mobile-optimized padding
- [X] T022 Create `src/components/layout/BottomNav.tsx` with 4 navigation items (Home, Workouts, Exercises, Profile) using gradient active state
- [X] T023 Create `src/components/layout/Header.tsx` with app logo and user avatar dropdown
- [X] T024 Create `src/app/(dashboard)/layout.tsx` with Header, BottomNav, and protected route wrapper

### PWA Infrastructure

- [X] T025 Create `src/app/manifest.ts` with PWA manifest (name, icons, theme_color #667eea, background_color #000000, display: standalone)
- [X] T026 [P] Process and save app icons to `public/icons/` (icon-192.png, icon-512.png, apple-touch-icon.png) from generated icon
- [X] T027 Create `public/sw.js` service worker with caching strategy for offline support
- [X] T028 [P] Create `public/offline.html` fallback page for offline access
- [X] T029 Register service worker in `src/app/layout.tsx` client component

### Validation & Constants

- [X] T030 [P] Create `src/lib/validations.ts` with Zod schemas for all API inputs (workouts, profiles, goals)
- [X] T031 [P] Create `src/lib/constants.ts` with app constants (muscle groups, equipment types, difficulty levels, goal types)
- [X] T032 [P] Create `src/lib/calories.ts` with MET-based calorie estimation function for treadmill workouts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - User Registration & Authentication (Priority: P1) 🎯 MVP

**Goal**: Users can create accounts, log in, log out, and reset passwords via Clerk

**Independent Test**: Create account → Log out → Log back in → Verify session persists

### Implementation for User Story 1

- [X] T033 [US1] Create user sync webhook handler `src/app/api/webhooks/clerk/route.ts` to sync Clerk users to database
- [X] T034 [US1] Create `src/lib/db/queries/users.ts` with user CRUD operations (createUser, getUser, updateUser)
- [X] T035 [US1] Create welcome/landing page `src/app/page.tsx` with hero section and sign-up CTA for unauthenticated users
- [ ] T036 [US1] Implement redirect logic in middleware to send authenticated users to dashboard
- [ ] T037 [US1] Add dark theme styling to Clerk components via `appearance` prop in ClerkProvider
- [X] T038 [US1] Create `src/app/(dashboard)/page.tsx` with basic dashboard shell showing user greeting

**Checkpoint**: User Story 1 complete - users can register, login, logout, and access protected dashboard

---

## Phase 4: User Story 2 - Treadmill Workout Logging (Priority: P1)

**Goal**: Users can start, time, and log treadmill workouts with distance, speed, and calorie tracking

**Independent Test**: Start workout → Timer runs → Enter distance → End workout → View in history

### Implementation for User Story 2

- [ ] T039 [P] [US2] Create `src/hooks/useWorkoutTimer.ts` with start, pause, resume, stop functionality and elapsed time state
- [ ] T040 [P] [US2] Create `src/components/workout/WorkoutTimer.tsx` component with large timer display and control buttons
- [ ] T041 [P] [US2] Create `src/components/workout/TreadmillForm.tsx` with distance input, speed display, and calorie estimate
- [ ] T042 [US2] Create `src/lib/db/queries/workouts.ts` with workout CRUD operations (createTreadmillWorkout, getWorkouts, getWorkoutById)
- [ ] T043 [US2] Create `src/app/api/workouts/treadmill/route.ts` API route for POST (create treadmill workout)
- [ ] T044 [US2] Create `src/app/api/workouts/route.ts` API route for GET (list workouts with pagination and filters)
- [ ] T045 [US2] Create `src/app/(dashboard)/workouts/new/page.tsx` with workout type selection and treadmill workout flow
- [ ] T046 [P] [US2] Create `src/components/workout/WorkoutCard.tsx` to display workout summary in lists
- [ ] T047 [US2] Create `src/app/(dashboard)/workouts/page.tsx` with workout history list (reverse chronological)
- [ ] T048 [US2] Create `src/app/(dashboard)/workouts/[id]/page.tsx` with workout detail view
- [ ] T049 [US2] Create `src/app/(dashboard)/workouts/manual/page.tsx` for manual workout entry with date picker

### Offline Support for User Story 2

- [ ] T050 [US2] Create `src/lib/offline/storage.ts` with IndexedDB setup for pending workouts using `idb`
- [ ] T051 [US2] Create `src/hooks/useOfflineSync.ts` hook to detect online status and trigger sync
- [ ] T052 [US2] Create `src/app/api/workouts/sync/route.ts` API route for batch syncing offline workouts
- [ ] T053 [US2] Add offline indicator badge to WorkoutCard for unsynced workouts
- [ ] T054 [US2] Integrate offline save/sync into workout completion flow

**Checkpoint**: User Story 2 complete - users can log treadmill workouts (live or manual) with offline support

---

## Phase 5: User Story 3 - Equipment Profile Setup (Priority: P2)

**Goal**: Users can select their available home gym equipment during onboarding and in settings

**Independent Test**: Complete onboarding → Select equipment → Save → Verify persists on refresh

### Implementation for User Story 3

- [ ] T055 [P] [US3] Create `src/components/ui/EquipmentToggle.tsx` with icon-based toggle buttons for each equipment type
- [ ] T056 [US3] Create `src/lib/db/queries/equipment.ts` with equipment profile CRUD operations
- [ ] T057 [US3] Create `src/app/api/user/equipment/route.ts` API routes for GET/PUT equipment profile
- [ ] T058 [US3] Create `src/app/(dashboard)/onboarding/page.tsx` with multi-step onboarding flow (fitness level, equipment, goals)
- [ ] T059 [US3] Create `src/app/(dashboard)/profile/page.tsx` with settings sections for profile, equipment, unit preferences
- [ ] T060 [US3] Create `src/app/api/user/profile/route.ts` API routes for GET/PATCH user profile (weight, unit preference, fitness level)
- [ ] T061 [US3] Add onboarding redirect logic for new users who haven't completed setup
- [ ] T062 [US3] Create `src/app/api/user/goals/route.ts` API routes for GET/PUT activity goals (daily/weekly)

**Checkpoint**: User Story 3 complete - users can configure equipment and preferences

---

## Phase 6: User Story 4 - Browse Workout Exercises (Priority: P2)

**Goal**: Users can browse a curated exercise library filtered by muscle group and equipment

**Independent Test**: Navigate to Exercises → Filter by equipment → View exercise detail

### Implementation for User Story 4

- [ ] T063 [P] [US4] Create `src/lib/db/seed/exercises.ts` with 50+ exercises covering all muscle groups and equipment types
- [ ] T064 [US4] Run seed script to populate exercises table: `pnpm db:seed`
- [ ] T065 [P] [US4] Create `src/components/exercise/ExerciseCard.tsx` with exercise name, muscle tags, and equipment badge
- [ ] T066 [P] [US4] Create `src/components/exercise/ExerciseFilters.tsx` with muscle group and equipment filter dropdowns
- [ ] T067 [US4] Create `src/lib/db/queries/exercises.ts` with exercise queries (getExercises with filters, getExerciseById)
- [ ] T068 [US4] Create `src/app/api/exercises/route.ts` API route for GET exercises with filtering
- [ ] T069 [US4] Create `src/app/api/exercises/[id]/route.ts` API route for GET single exercise
- [ ] T070 [US4] Create `src/app/(dashboard)/exercises/page.tsx` with exercise grid and filter bar
- [ ] T071 [US4] Create `src/app/(dashboard)/exercises/[id]/page.tsx` with exercise detail (instructions, muscles, difficulty)
- [ ] T072 [US4] Integrate user equipment filter to hide/mark unavailable exercises based on profile

**Checkpoint**: User Story 4 complete - users can browse and filter exercises

---

## Phase 7: User Story 5 - AI-Powered Workout Plan Generation (Priority: P3)

**Goal**: Users can generate personalized AI workout plans based on goals, equipment, and fitness level

**Independent Test**: Set goals → Generate plan → View exercises → Save to library → Start workout

### AI Client Setup

- [ ] T073 [P] [US5] Create `src/lib/ai/client.ts` with OpenAI SDK configured for LiteLLM endpoint
- [ ] T074 [P] [US5] Create `src/lib/ai/prompts/workout-generation.ts` with prompt template for workout plan generation

### Workout Plan Implementation

- [ ] T075 [US5] Create `src/lib/db/queries/plans.ts` with workout plan CRUD operations (createPlan, getPlans, getPlanById, deletePlan)
- [ ] T076 [US5] Create `src/app/api/ai/generate/route.ts` API route for POST AI workout generation with rate limiting
- [ ] T077 [P] [US5] Create `src/components/plan/GenerateForm.tsx` with goal selector, duration picker, and generate button
- [ ] T078 [P] [US5] Create `src/components/plan/PlanCard.tsx` with plan name, goal, duration, and exercise count
- [ ] T079 [US5] Create `src/app/(dashboard)/plans/generate/page.tsx` with generation form and result display
- [ ] T080 [US5] Create `src/app/api/plans/route.ts` API routes for GET saved plans
- [ ] T081 [US5] Create `src/app/api/plans/[id]/route.ts` API routes for GET/DELETE single plan
- [ ] T082 [US5] Create `src/app/api/plans/[id]/save/route.ts` API route for POST save AI plan to library
- [ ] T083 [US5] Create `src/app/(dashboard)/plans/page.tsx` with saved plans grid ("My Workouts" library)
- [ ] T084 [US5] Create `src/app/(dashboard)/plans/[id]/page.tsx` with plan detail and "Start Workout" button

### Guided Workout & Strength Logging

- [ ] T085 [P] [US5] Create `src/components/plan/WorkoutGuide.tsx` with exercise-by-exercise navigation, timer, and rep counter
- [ ] T086 [P] [US5] Create `src/components/workout/StrengthLogForm.tsx` with sets/reps/weight input for each exercise
- [ ] T087 [US5] Create `src/app/(dashboard)/plans/[id]/start/page.tsx` with guided workout flow
- [ ] T088 [US5] Create `src/app/api/workouts/strength/route.ts` API route for POST strength workout log
- [ ] T089 [US5] Create `src/lib/db/queries/strength.ts` with strength workout operations
- [ ] T090 [US5] Integrate strength workouts into workout history display

### Error Handling

- [ ] T091 [US5] Add AI service error handling with fallback UI suggesting exercise library browse
- [ ] T092 [US5] Add "Regenerate" button functionality with loading state

**Checkpoint**: User Story 5 complete - users can generate, save, start, and log AI workouts

---

## Phase 8: User Story 6 - Workout History & Progress Dashboard (Priority: P2)

**Goal**: Users can view workout history, statistics, charts, and activity ring progress

**Independent Test**: Log workouts → View dashboard → See stats update → View weekly breakdown

### Dashboard Components

- [ ] T093 [P] [US6] Create `src/components/workout/ActivityRing.tsx` with SVG circular progress and gradient stroke
- [ ] T094 [P] [US6] Create `src/components/dashboard/StatsCard.tsx` with large number, label, and trend indicator
- [ ] T095 [P] [US6] Create `src/components/dashboard/WeeklyChart.tsx` with simple bar/line chart for 4-week trends
- [ ] T096 [P] [US6] Create `src/components/dashboard/GoalProgress.tsx` with activity rings for daily/weekly goals
- [ ] T097 [US6] Create `src/hooks/useActivityGoals.ts` hook for calculating goal progress from workout data

### Dashboard API & Page

- [ ] T098 [US6] Create `src/lib/db/queries/dashboard.ts` with aggregation queries (weekly stats, streak, trends)
- [ ] T099 [US6] Create `src/app/api/dashboard/stats/route.ts` API route for GET dashboard statistics
- [ ] T100 [US6] Create `src/app/api/dashboard/weekly/route.ts` API route for GET weekly breakdown by date
- [ ] T101 [US6] Update `src/app/(dashboard)/page.tsx` with full dashboard: stats cards, activity rings, weekly chart
- [ ] T102 [US6] Add empty state UI for users with no workouts (encouraging first workout prompt)
- [ ] T103 [US6] Add week-by-week navigation in dashboard to view historical data

**Checkpoint**: User Story 6 complete - users can view comprehensive progress dashboard

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting all user stories

### Performance & PWA

- [ ] T104 [P] Run Lighthouse audit and address any PWA/Performance issues below score 90
- [ ] T105 [P] Add loading.tsx skeleton components for all dashboard routes
- [ ] T106 [P] Add error.tsx error boundary components with retry actions
- [ ] T107 Verify offline workout logging end-to-end (airplane mode test)
- [ ] T108 [P] Add optimistic UI updates for workout creation

### Validation & Security

- [ ] T109 [P] Add Zod validation to all API routes using schemas from validations.ts
- [ ] T110 [P] Add rate limiting to AI generation endpoint (10 requests/day per user)
- [ ] T111 Verify Clerk auth check at data access layer (defense in depth)

### Documentation & Cleanup

- [ ] T112 [P] Create `README.md` with project overview, setup instructions, and architecture
- [ ] T113 [P] Create `.env.example` with all required variables documented
- [ ] T114 [P] Add inline code comments for complex logic (calorie calculation, offline sync)
- [ ] T115 Run `pnpm lint` and fix all linting errors
- [ ] T116 Run `pnpm type-check` and fix all TypeScript errors
- [ ] T117 Run quickstart.md validation to verify development setup works

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ──► Phase 2 (Foundational) ──► Phase 3+ (User Stories)
                                               ├── US1 (Auth)
                                               ├── US2 (Treadmill) ←─ depends on US1
                                               ├── US3 (Equipment) ←─ depends on US1
                                               ├── US4 (Exercises) ←─ depends on US1
                                               ├── US5 (AI Plans) ←─ depends on US3, US4
                                               └── US6 (Dashboard) ←─ depends on US2
                                                         │
                                                         ▼
                                               Phase 9 (Polish)
```

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US1 (Auth) | Foundational only | - |
| US2 (Treadmill) | US1 | US3, US4 |
| US3 (Equipment) | US1 | US2, US4, US6 |
| US4 (Exercises) | US1 | US2, US3, US6 |
| US5 (AI Plans) | US3, US4 | - |
| US6 (Dashboard) | US2 | US3, US4, US5 |

### Within Each User Story

1. Models/Queries before API routes
2. API routes before pages
3. Components can parallel with API (different files)
4. Integration last (connecting pieces)

---

## Parallel Opportunities

### Phase 2 (Foundational) Parallel Tasks

```bash
# Can run simultaneously:
T002, T003, T004, T005        # Config files
T008, T009, T010              # Lib files
T017, T018                    # Auth pages
T026, T028, T030, T031, T032  # Static assets and utils
```

### User Story 2 Parallel Tasks

```bash
# Can run simultaneously:
T039, T040, T041  # Timer hook and components (different files)
T046              # WorkoutCard component (standalone)
```

### User Story 4 Parallel Tasks

```bash
# Can run simultaneously:
T063, T065, T066  # Seed data and components (different files)
```

### User Story 5 Parallel Tasks

```bash
# Can run simultaneously:
T073, T074        # AI client setup
T077, T078        # Plan components
T085, T086        # Workout guide components
```

### User Story 6 Parallel Tasks

```bash
# Can run simultaneously:
T093, T094, T095, T096  # All dashboard components (different files)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (T001-T010)
2. Complete Phase 2: Foundational (T011-T032)
3. Complete Phase 3: US1 Auth (T033-T038)
4. Complete Phase 4: US2 Treadmill (T039-T054)
5. **STOP and VALIDATE**: Users can register and log treadmill workouts
6. Deploy MVP to Vercel

### Full MVP Delivery

1. MVP First (above)
2. Add US3 Equipment + US6 Dashboard (parallel paths)
3. Add US4 Exercise Library
4. Add US5 AI Workout Plans (requires US3, US4)
5. Complete Polish phase
6. Final Lighthouse audit and deploy

---

## Summary

| Metric | Count |
|--------|-------|
| **Total Tasks** | 117 |
| **Phase 1 (Setup)** | 10 |
| **Phase 2 (Foundational)** | 22 |
| **US1 (Auth)** | 6 |
| **US2 (Treadmill)** | 16 |
| **US3 (Equipment)** | 8 |
| **US4 (Exercises)** | 10 |
| **US5 (AI Plans)** | 20 |
| **US6 (Dashboard)** | 11 |
| **Phase 9 (Polish)** | 14 |
| **Parallel Tasks [P]** | 48 |

**Suggested MVP Scope**: Phase 1 + Phase 2 + US1 + US2 = 54 tasks for minimal working product

---

## Notes

- [P] tasks can run in parallel (different files, no dependencies)
- [Story] labels map tasks to user stories for traceability
- Each user story is independently testable at its checkpoint
- Commit after each task or logical group
- Run `pnpm dev` frequently to verify no build errors
- Test offline functionality on actual mobile device before final polish
