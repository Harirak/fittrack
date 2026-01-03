// Database schema for FitTrack Pro MVP
// Uses Drizzle ORM with Neon Postgres
import {
  pgTable,
  text,
  real,
  integer,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// ============= Enums =============
export const unitPreferenceEnum = pgEnum('unit_preference', ['metric', 'imperial']);
export const fitnessLevelEnum = pgEnum('fitness_level', ['beginner', 'intermediate', 'advanced']);
export const workoutTypeEnum = pgEnum('workout_type', ['treadmill', 'strength']);
export const difficultyEnum = pgEnum('difficulty', ['beginner', 'intermediate', 'advanced']);
export const equipmentEnum = pgEnum('equipment', ['bodyweight', 'dumbbells', 'barbells', 'kettlebells']);
export const goalEnum = pgEnum('goal', ['build_muscle', 'lose_weight', 'general_fitness']);
export const goalTypeEnum = pgEnum('goal_type', ['daily', 'weekly']);

// ============= Users Table =============
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull().unique(),
  name: text('name'),
  weightKg: real('weight_kg'),
  unitPreference: unitPreferenceEnum('unit_preference').default('metric').notNull(),
  fitnessLevel: fitnessLevelEnum('fitness_level').default('beginner').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============= Equipment Profiles Table =============
export const equipmentProfiles = pgTable('equipment_profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  dumbbells: boolean('dumbbells').default(false).notNull(),
  barbells: boolean('barbells').default(false).notNull(),
  kettlebells: boolean('kettlebells').default(false).notNull(),
  bodyweight: boolean('bodyweight').default(true).notNull(), // Always available
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============= Workouts Table =============
export const workouts = pgTable('workouts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: workoutTypeEnum('type').notNull(),
  startedAt: timestamp('started_at').notNull(),
  endedAt: timestamp('ended_at'),
  durationSeconds: integer('duration_seconds').notNull(),
  notes: text('notes'),
  synced: boolean('synced').default(true).notNull(),
  localId: text('local_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('workouts_user_id_idx').on(table.userId),
  startedAtIdx: index('workouts_started_at_idx').on(table.startedAt),
}));

// ============= Treadmill Data Table =============
export const treadmillData = pgTable('treadmill_data', {
  workoutId: text('workout_id').references(() => workouts.id, { onDelete: 'cascade' }).primaryKey(),
  distanceKm: real('distance_km').notNull(),
  avgSpeedKmh: real('avg_speed_kmh').notNull(),
  caloriesBurned: integer('calories_burned'),
});

// ============= Strength Workout Data Table =============
export const strengthWorkoutData = pgTable('strength_workout_data', {
  workoutId: text('workout_id').references(() => workouts.id, { onDelete: 'cascade' }).primaryKey(),
  planId: text('plan_id').references(() => workoutPlans.id, { onDelete: 'set null' }),
  exercises: jsonb('exercises').$type<StrengthExerciseLog>().notNull(),
});

// Type for strength workout exercises JSON field
export interface StrengthExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: {
    reps: number;
    weightKg?: number;
    completed: boolean;
  }[];
}

// ============= Exercises Table =============
export const exercises = pgTable('exercises', {
  id: text('id').primaryKey(), // Slug-based ID: 'dumbbell-bench-press'
  name: text('name').notNull(),
  description: text('description').notNull(),
  muscleGroups: text('muscle_groups').array().notNull(),
  equipment: equipmentEnum('equipment').notNull(),
  difficulty: difficultyEnum('difficulty').notNull(),
  instructions: text('instructions').notNull(),
  imageUrl: text('image_url'),
}, (table) => ({
  equipmentIdx: index('exercises_equipment_idx').on(table.equipment),
  muscleGroupsIdx: index('exercises_muscle_groups_idx').on(table.muscleGroups),
}));

// Muscle group type
export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves';

// ============= Workout Plans Table =============
export const workoutPlans = pgTable('workout_plans', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  goal: goalEnum('goal').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  exercises: jsonb('exercises').$type<PlanExercise>().notNull(),
  isAiGenerated: boolean('is_ai_generated').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type for workout plan exercises JSON field
export interface PlanExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number | string; // "12" or "8-12" or "30 seconds"
  restSeconds: number;
  notes?: string;
}

// ============= Activity Goals Table =============
export const activityGoals = pgTable('activity_goals', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: goalTypeEnum('type').notNull(),
  durationMinutes: integer('duration_minutes').default(30).notNull(),
  distanceKm: real('distance_km').default(3).notNull(),
  workoutCount: integer('workout_count').default(1).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userGoalUnique: uniqueIndex('activity_goals_user_type_unique').on(table.userId, table.type),
}));

// ============= Type Exports =============
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type EquipmentProfile = typeof equipmentProfiles.$inferSelect;
export type NewEquipmentProfile = typeof equipmentProfiles.$inferInsert;

export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;

export type TreadmillData = typeof treadmillData.$inferSelect;
export type NewTreadmillData = typeof treadmillData.$inferInsert;

export type StrengthWorkoutData = typeof strengthWorkoutData.$inferSelect;
export type NewStrengthWorkoutData = typeof strengthWorkoutData.$inferInsert;

export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;

export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type NewWorkoutPlan = typeof workoutPlans.$inferInsert;

export type ActivityGoal = typeof activityGoals.$inferSelect;
export type NewActivityGoal = typeof activityGoals.$inferInsert;
