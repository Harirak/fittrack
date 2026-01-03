// Zod validation schemas for FitTrack Pro MVP
import { z } from 'zod';

// ============= Common Validators =============
export const positiveNumberSchema = z.number().positive('Must be a positive number');
export const nonNegativeNumberSchema = z.number().nonnegative('Must be zero or positive');
export const optionalStringSchema = z.string().max(500, 'Notes cannot exceed 500 characters').optional().nullable();

// ============= Workout Validations =============
export const treadmillWorkoutSchema = z.object({
  distanceKm: z.number().min(0.01, 'Distance must be at least 0.01 km').max(100, 'Distance cannot exceed 100 km'),
  durationSeconds: z.number().min(1, 'Duration must be at least 1 second').max(86400, 'Duration cannot exceed 24 hours'),
  startedAt: z.string().datetime().optional(),
  notes: optionalStringSchema,
});

export const strengthExerciseSetSchema = z.object({
  reps: z.number().int().positive('Reps must be a positive integer'),
  weightKg: z.number().positive('Weight must be positive').optional(),
  completed: z.boolean(),
});

export const strengthExerciseLogSchema = z.object({
  exerciseId: z.string().min(1, 'Exercise ID is required'),
  exerciseName: z.string().min(1, 'Exercise name is required'),
  sets: z.array(strengthExerciseSetSchema).min(1, 'At least one set is required'),
});

export const strengthWorkoutSchema = z.object({
  exercises: z.array(strengthExerciseLogSchema).min(1, 'At least one exercise is required'),
  planId: z.string().optional(),
  durationSeconds: z.number().min(1, 'Duration must be at least 1 second').max(86400, 'Duration cannot exceed 24 hours'),
  startedAt: z.string().datetime().optional(),
  notes: optionalStringSchema,
});

// ============= Equipment Profile Validations =============
export const equipmentProfileSchema = z.object({
  dumbbells: z.boolean().default(false),
  barbells: z.boolean().default(false),
  kettlebells: z.boolean().default(false),
  bodyweight: z.boolean().default(true), // Always available
}).refine(
  (data) => data.dumbbells || data.barbells || data.kettlebells || data.bodyweight,
  'At least one equipment type must be selected'
);

// ============= User Profile Validations =============
export const userProfileSchema = z.object({
  weightKg: z.number().min(20, 'Weight must be at least 20 kg').max(300, 'Weight cannot exceed 300 kg').optional(),
  unitPreference: z.enum(['metric', 'imperial']),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
});

// ============= Activity Goals Validations =============
export const activityGoalSchema = z.object({
  type: z.enum(['daily', 'weekly']),
  durationMinutes: z.number().int().positive('Duration must be positive'),
  distanceKm: z.number().positive('Distance must be positive'),
  workoutCount: z.number().int().positive('Workout count must be positive'),
});

// ============= Workout Plan Generation Validations =============
export const generateWorkoutPlanSchema = z.object({
  goal: z.enum(['build_muscle', 'lose_weight', 'general_fitness']),
  durationMinutes: z.enum(['15', '30', '45', '60']).transform(Number),
  equipment: z.array(z.enum(['bodyweight', 'dumbbells', 'barbells', 'kettlebells'])).min(1, 'At least one equipment type is required'),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
});

// ============= Exercise Filter Validations =============
export const exerciseFilterSchema = z.object({
  muscleGroup: z.enum([
    'chest',
    'back',
    'shoulders',
    'biceps',
    'triceps',
    'core',
    'quadriceps',
    'hamstrings',
    'glutes',
    'calves',
  ]).optional(),
  equipment: z.enum(['bodyweight', 'dumbbells', 'barbells', 'kettlebells']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  search: z.string().optional(),
});

// ============= Pagination Validations =============
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============= Query Parameter Validations =============
export const workoutQuerySchema = paginationSchema.extend({
  type: z.enum(['treadmill', 'strength']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// ============= Export Types =============
export type TreadmillWorkoutInput = z.infer<typeof treadmillWorkoutSchema>;
export type StrengthWorkoutInput = z.infer<typeof strengthWorkoutSchema>;
export type EquipmentProfileInput = z.infer<typeof equipmentProfileSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type ActivityGoalInput = z.infer<typeof activityGoalSchema>;
export type GenerateWorkoutPlanInput = z.infer<typeof generateWorkoutPlanSchema>;
export type ExerciseFilterInput = z.infer<typeof exerciseFilterSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type WorkoutQueryInput = z.infer<typeof workoutQuerySchema>;
