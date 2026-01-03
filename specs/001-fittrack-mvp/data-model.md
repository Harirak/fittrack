# Data Model: FitTrack Pro MVP

**Branch**: `001-fittrack-mvp` | **Date**: 2026-01-03

## Overview

This document defines the database schema for FitTrack Pro MVP using Drizzle ORM with Neon Postgres.

---

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────────┐
│     users       │       │  equipment_profiles │
│─────────────────│       │─────────────────────│
│ id (clerk_id)   │◄──────│ user_id             │
│ email           │       │ dumbbells           │
│ name            │       │ barbells            │
│ weight          │       │ kettlebells         │
│ unit_preference │       │ bodyweight          │
│ fitness_level   │       │ updated_at          │
│ created_at      │       └─────────────────────┘
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐     ┌─────────────────────┐
│      workouts       │     │   workout_plans     │
│─────────────────────│     │─────────────────────│
│ id                  │     │ id                  │
│ user_id             │     │ user_id             │
│ type                │     │ name                │
│ started_at          │     │ goal                │
│ ended_at            │     │ duration_minutes    │
│ duration_seconds    │     │ exercises (json)    │
│ notes               │     │ is_ai_generated     │
│ synced              │     │ created_at          │
│ local_id            │     └─────────────────────┘
│ created_at          │
└────────┬────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌──────────────────┐  ┌────────────────────────┐
│ treadmill_data   │  │ strength_workout_data  │
│──────────────────│  │────────────────────────│
│ workout_id       │  │ workout_id             │
│ distance_km      │  │ exercises (json)       │
│ avg_speed_kmh    │  │ plan_id (optional)     │
│ calories_burned  │  └────────────────────────┘
└──────────────────┘

┌─────────────────────┐     ┌─────────────────────┐
│     exercises       │     │    activity_goals   │
│─────────────────────│     │─────────────────────│
│ id                  │     │ id                  │
│ name                │     │ user_id             │
│ description         │     │ type (daily/weekly) │
│ muscle_groups       │     │ duration_minutes    │
│ equipment           │     │ distance_km         │
│ difficulty          │     │ workout_count       │
│ instructions        │     │ updated_at          │
└─────────────────────┘     └─────────────────────┘
```

---

## Schema Definitions

### Users Table

Synced with Clerk - stores additional fitness profile data.

```typescript
// lib/db/schema.ts
import { pgTable, text, real, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const unitPreferenceEnum = pgEnum('unit_preference', ['metric', 'imperial']);
export const fitnessLevelEnum = pgEnum('fitness_level', ['beginner', 'intermediate', 'advanced']);

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull(),
  name: text('name'),
  weightKg: real('weight_kg'), // Stored in kg, converted for display
  unitPreference: unitPreferenceEnum('unit_preference').default('metric').notNull(),
  fitnessLevel: fitnessLevelEnum('fitness_level').default('beginner').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

**Validation Rules**:
- `id`: Must match Clerk user ID format
- `email`: Valid email format, unique
- `weightKg`: If provided, must be between 20 and 300
- `unitPreference`: Default 'metric'
- `fitnessLevel`: Default 'beginner'

---

### Equipment Profiles Table

Tracks user's available home gym equipment.

```typescript
export const equipmentProfiles = pgTable('equipment_profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  dumbbells: boolean('dumbbells').default(false).notNull(),
  barbells: boolean('barbells').default(false).notNull(),
  kettlebells: boolean('kettlebells').default(false).notNull(),
  bodyweight: boolean('bodyweight').default(true).notNull(), // Always available
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

**Validation Rules**:
- At least one equipment type must be true (bodyweight is always available)
- One profile per user (unique constraint on userId)

---

### Workouts Table

Base table for all workout types (treadmill, strength).

```typescript
export const workoutTypeEnum = pgEnum('workout_type', ['treadmill', 'strength']);

export const workouts = pgTable('workouts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: workoutTypeEnum('type').notNull(),
  startedAt: timestamp('started_at').notNull(),
  endedAt: timestamp('ended_at'),
  durationSeconds: integer('duration_seconds').notNull(), // Calculated from start/end or manual
  notes: text('notes'),
  synced: boolean('synced').default(true).notNull(), // For offline sync tracking
  localId: text('local_id'), // Client-generated ID for offline workouts
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Index for efficient user workout queries
export const workoutsUserIdIdx = index('workouts_user_id_idx').on(workouts.userId);
export const workoutsStartedAtIdx = index('workouts_started_at_idx').on(workouts.startedAt);
```

**Validation Rules**:
- `durationSeconds`: Must be positive (0 < duration < 86400 for 24h max)
- `startedAt`: Cannot be in the future
- `localId`: Unique per user for offline sync deduplication

---

### Treadmill Data Table

Extended data for treadmill workout type.

```typescript
export const treadmillData = pgTable('treadmill_data', {
  workoutId: text('workout_id').references(() => workouts.id, { onDelete: 'cascade' }).primaryKey(),
  distanceKm: real('distance_km').notNull(),
  avgSpeedKmh: real('avg_speed_kmh').notNull(), // Calculated: distance / (duration/3600)
  caloriesBurned: integer('calories_burned'), // Estimated using MET formula
});
```

**Validation Rules**:
- `distanceKm`: Must be positive, max 100km
- `avgSpeedKmh`: Must be positive, max 25 km/h (realistic treadmill max)
- `caloriesBurned`: Positive integer

**Calculated Fields**:
- `avgSpeedKmh` = `distanceKm / (durationSeconds / 3600)`
- `caloriesBurned` = MET formula based on speed and user weight

---

### Strength Workout Data Table

Extended data for strength workout type.

```typescript
export const strengthWorkoutData = pgTable('strength_workout_data', {
  workoutId: text('workout_id').references(() => workouts.id, { onDelete: 'cascade' }).primaryKey(),
  planId: text('plan_id').references(() => workoutPlans.id, { onDelete: 'set null' }),
  exercises: jsonb('exercises').$type<StrengthExerciseLog[]>().notNull(),
});

// Type for exercises JSON field
interface StrengthExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: {
    reps: number;
    weightKg?: number;
    completed: boolean;
  }[];
}
```

**Validation Rules**:
- `exercises`: Must be non-empty array
- Each exercise must have at least one set
- `reps`: Positive integer
- `weightKg`: If provided, positive number

---

### Exercises Table

Curated exercise library (seeded data).

```typescript
export const difficultyEnum = pgEnum('difficulty', ['beginner', 'intermediate', 'advanced']);
export const equipmentEnum = pgEnum('equipment', ['bodyweight', 'dumbbells', 'barbells', 'kettlebells']);

export const exercises = pgTable('exercises', {
  id: text('id').primaryKey(), // Slug-based ID: 'dumbbell-bench-press'
  name: text('name').notNull(),
  description: text('description').notNull(),
  muscleGroups: text('muscle_groups').array().notNull(), // ['chest', 'triceps']
  equipment: equipmentEnum('equipment').notNull(),
  difficulty: difficultyEnum('difficulty').notNull(),
  instructions: text('instructions').notNull(),
  imageUrl: text('image_url'), // Optional exercise illustration
});

export const exercisesEquipmentIdx = index('exercises_equipment_idx').on(exercises.equipment);
export const exercisesMuscleGroupsIdx = index('exercises_muscle_groups_idx').on(exercises.muscleGroups);
```

**Muscle Groups** (enumerated values):
- `chest`, `back`, `shoulders`, `biceps`, `triceps`
- `core`, `quadriceps`, `hamstrings`, `glutes`, `calves`

---

### Workout Plans Table

AI-generated or saved workout routines.

```typescript
export const goalEnum = pgEnum('goal', ['build_muscle', 'lose_weight', 'general_fitness']);

export const workoutPlans = pgTable('workout_plans', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  goal: goalEnum('goal').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  exercises: jsonb('exercises').$type<PlanExercise[]>().notNull(),
  isAiGenerated: boolean('is_ai_generated').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type for exercises JSON field
interface PlanExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number | string; // "12" or "8-12" or "30 seconds"
  restSeconds: number;
  notes?: string;
}
```

**Validation Rules**:
- `name`: 1-100 characters
- `durationMinutes`: One of [15, 30, 45, 60]
- `exercises`: Non-empty array with 3-15 exercises

---

### Activity Goals Table

User-configurable daily/weekly fitness targets.

```typescript
export const goalTypeEnum = pgEnum('goal_type', ['daily', 'weekly']);

export const activityGoals = pgTable('activity_goals', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: goalTypeEnum('type').notNull(),
  durationMinutes: integer('duration_minutes').default(30).notNull(),
  distanceKm: real('distance_km').default(3).notNull(),
  workoutCount: integer('workout_count').default(1).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Unique constraint: one goal per user per type
export const activityGoalsUniqueIdx = uniqueIndex('activity_goals_user_type_unique').on(
  activityGoals.userId,
  activityGoals.type
);
```

**Default Goals**:
- Daily: 30 min duration, 3 km distance, 1 workout
- Weekly: 150 min duration, 20 km distance, 4 workouts

---

## State Transitions

### Workout Lifecycle

```
[Not Started] 
    │
    │ User taps "Start Workout"
    ▼
[In Progress] ─────────────────┐
    │                          │
    │ Timer running            │ User taps "Pause"
    │                          ▼
    │                    [Paused]
    │                          │
    │                          │ User taps "Resume"
    │◄─────────────────────────┘
    │
    │ User taps "End Workout"
    ▼
[Completing] 
    │
    │ User enters metrics / confirms
    ▼
[Completed] 
    │
    │ If offline: synced=false
    ▼
[Synced] (synced=true)
```

### Offline Sync States

```
[Created Offline] ──► [Pending Sync] ──► [Synced]
                           │
                           │ Sync failure
                           ▼
                     [Retry Queue] ──► [Synced]
```

---

## Indexes Summary

| Table | Index | Purpose |
|-------|-------|---------|
| workouts | user_id | User workout queries |
| workouts | started_at | Date-based filtering |
| exercises | equipment | Equipment filtering |
| exercises | muscle_groups | Muscle group filtering |
| activity_goals | (user_id, type) unique | One goal per type per user |

---

## Migration Order

1. Create enums (unit_preference, fitness_level, workout_type, etc.)
2. Create users table
3. Create equipment_profiles table (references users)
4. Create exercises table (no references - seed data)
5. Create workouts table (references users)
6. Create treadmill_data table (references workouts)
7. Create workout_plans table (references users)
8. Create strength_workout_data table (references workouts, workout_plans)
9. Create activity_goals table (references users)
10. Seed exercises table with 50+ exercises
