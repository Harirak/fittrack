import { db } from '@/lib/db/index';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { schema } from '@/lib/db/index';

export type TreadmillWorkoutInput = {
  userId: string;
  startedAt: Date;
  endedAt: Date;
  durationSeconds: number;
  distanceKm: number;
  avgSpeedKmh: number;
  caloriesBurned?: number;
  notes?: string;
};

export type StrengthWorkoutInput = {
  userId: string;
  startedAt: Date;
  endedAt: Date;
  durationSeconds: number;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    sets: {
      reps: number;
      weightKg?: number;
      completed: boolean;
    }[];
  }[];
  planId?: string;
  notes?: string;
};

/**
 * Create a treadmill workout with its associated data
 */
export async function createTreadmillWorkout(input: TreadmillWorkoutInput) {
  const workoutId = crypto.randomUUID();

  // Create the base workout
  const [workout] = await db
    .insert(schema.workouts)
    .values({
      id: workoutId,
      userId: input.userId,
      type: 'treadmill',
      startedAt: input.startedAt,
      endedAt: input.endedAt,
      durationSeconds: input.durationSeconds,
      notes: input.notes,
    })
    .returning();

  // Create the treadmill-specific data
  await db.insert(schema.treadmillData).values({
    workoutId,
    distanceKm: input.distanceKm,
    avgSpeedKmh: input.avgSpeedKmh,
    caloriesBurned: input.caloriesBurned,
  });

  return workout;
}

/**
 * Create a strength workout with its associated data
 */
export async function createStrengthWorkout(input: StrengthWorkoutInput) {
  const workoutId = crypto.randomUUID();

  // Create the base workout
  const [workout] = await db
    .insert(schema.workouts)
    .values({
      id: workoutId,
      userId: input.userId,
      type: 'strength',
      startedAt: input.startedAt,
      endedAt: input.endedAt,
      durationSeconds: input.durationSeconds,
      notes: input.notes,
    })
    .returning();

  // Create the strength-specific data
  const strengthData: any = {
    workoutId,
    exercises: input.exercises,
  };

  if (input.planId) {
    strengthData.planId = input.planId;
  }

  await db.insert(schema.strengthWorkoutData).values(strengthData);

  return workout;
}

/**
 * Get all workouts for a user with pagination
 */
export async function getUserWorkouts(opts: { limit?: number; offset?: number } = {}) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const { limit = 20, offset = 0 } = opts;

  const userWorkouts = await db.query.workouts.findMany({
    where: eq(schema.workouts.userId, userId),
    with: {
      treadmillData: true,
      strengthData: true,
    },
    orderBy: [desc(schema.workouts.startedAt)],
    limit,
    offset,
  });

  return userWorkouts;
}

/**
 * Get a single workout by ID with all related data
 */
export async function getWorkoutById(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const workout = await db.query.workouts.findFirst({
    where: and(eq(schema.workouts.id, id), eq(schema.workouts.userId, userId)),
    with: {
      treadmillData: true,
      strengthData: true,
    },
  });

  return workout;
}

/**
 * Get workouts within a date range
 */
export async function getWorkoutsByDateRange(startDate: Date, endDate: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const userWorkouts = await db.query.workouts.findMany({
    where: and(
      eq(schema.workouts.userId, userId),
      gte(schema.workouts.startedAt, startDate),
      lte(schema.workouts.startedAt, endDate)
    ),
    with: {
      treadmillData: true,
      strengthData: true,
    },
    orderBy: [desc(schema.workouts.startedAt)],
  });

  return userWorkouts;
}

/**
 * Get workout statistics for a user
 */
export async function getWorkoutStats() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const userWorkouts = await db
    .select()
    .from(schema.workouts)
    .where(eq(schema.workouts.userId, userId));

  const totalWorkouts = userWorkouts.length;
  const totalDuration = userWorkouts.reduce((sum, w) => sum + w.durationSeconds, 0);
  const treadmillWorkouts = userWorkouts.filter((w) => w.type === 'treadmill').length;
  const strengthWorkouts = userWorkouts.filter((w) => w.type === 'strength').length;

  return {
    totalWorkouts,
    totalDuration,
    totalDurationMinutes: Math.floor(totalDuration / 60),
    treadmillWorkouts,
    strengthWorkouts,
  };
}
