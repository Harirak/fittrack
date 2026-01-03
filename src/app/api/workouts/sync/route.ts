/**
 * API route for batch syncing offline workouts
 * POST /api/workouts/sync
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { workouts, treadmillData, strengthWorkoutData, type StrengthExerciseLog } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface SyncWorkoutInput {
  localId: string;
  type: 'treadmill' | 'strength';
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  notes?: string;
  // Treadmill-specific
  distanceKm?: number;
  avgSpeedKmh?: number;
  caloriesBurned?: number;
  // Strength-specific
  exercises?: Array<{
    exerciseId: string;
    exerciseName: string;
    sets: Array<{
      reps: number;
      weightKg?: number;
      completed: boolean;
    }>;
  }>;
  planId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { workouts: workoutsToSync } = body as { workouts: SyncWorkoutInput[] };

    if (!Array.isArray(workoutsToSync) || workoutsToSync.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: workouts array required' },
        { status: 400 }
      );
    }

    // Cap the number of workouts per sync request
    const MAX_BATCH_SIZE = 50;
    if (workoutsToSync.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: `Too many workouts. Maximum ${MAX_BATCH_SIZE} per request.` },
        { status: 400 }
      );
    }

    let syncedCount = 0;
    let failedCount = 0;
    const errors: Array<{ localId: string; error: string }> = [];

    // Process each workout
    for (const workoutInput of workoutsToSync) {
      try {
        // Check if this localId was already synced (prevent duplicates)
        const existing = await db
          .select()
          .from(workouts)
          .where(eq(workouts.localId, workoutInput.localId))
          .limit(1);

        if (existing.length > 0) {
          console.log(`[Sync] Workout ${workoutInput.localId} already synced, skipping`);
          syncedCount++;
          continue;
        }

        // Generate a new ID for this workout
        const workoutId = crypto.randomUUID();

        // Parse dates
        const startedAt = new Date(workoutInput.startedAt);
        const endedAt = workoutInput.endedAt
          ? new Date(workoutInput.endedAt)
          : new Date(workoutInput.startedAt);

        // Validate dates
        if (isNaN(startedAt.getTime()) || isNaN(endedAt.getTime())) {
          throw new Error('Invalid date format');
        }

        // Create base workout record
        await db.insert(workouts).values({
          id: workoutId,
          userId,
          type: workoutInput.type,
          startedAt,
          endedAt,
          durationSeconds: workoutInput.durationSeconds,
          notes: workoutInput.notes,
          synced: true,
          localId: workoutInput.localId,
          createdAt: new Date(),
        });

        // Create type-specific data
        if (workoutInput.type === 'treadmill') {
          if (!workoutInput.distanceKm || !workoutInput.avgSpeedKmh) {
            throw new Error('Missing required treadmill fields');
          }

          await db.insert(treadmillData).values({
            workoutId,
            distanceKm: workoutInput.distanceKm,
            avgSpeedKmh: workoutInput.avgSpeedKmh,
            caloriesBurned: workoutInput.caloriesBurned,
          });
        } else if (workoutInput.type === 'strength') {
          if (!workoutInput.exercises || workoutInput.exercises.length === 0) {
            throw new Error('Missing required strength fields');
          }

          // The exercises array matches the StrengthExerciseLog[] type
          await db.insert(strengthWorkoutData).values({
            workoutId,
            planId: workoutInput.planId || null,
            exercises: workoutInput.exercises as StrengthExerciseLog[],
          });
        }

        syncedCount++;
        console.log(`[Sync] Successfully synced workout ${workoutInput.localId} -> ${workoutId}`);
      } catch (error) {
        failedCount++;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push({
          localId: workoutInput.localId,
          error: errorMessage,
        });
        console.error(`[Sync] Failed to sync workout ${workoutInput.localId}:`, error);
      }
    }

    return NextResponse.json({
      synced: syncedCount,
      failed: failedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('[Sync] Sync request error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Validate request body
function validateWorkoutInput(input: unknown): input is SyncWorkoutInput {
  if (typeof input !== 'object' || input === null) {
    return false;
  }

  const workout = input as Record<string, unknown>;

  return (
    typeof workout.localId === 'string' &&
    (workout.type === 'treadmill' || workout.type === 'strength') &&
    typeof workout.startedAt === 'string' &&
    typeof workout.durationSeconds === 'number' &&
    workout.durationSeconds > 0
  );
}
