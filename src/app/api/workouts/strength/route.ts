import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createStrengthWorkout } from '@/lib/db/queries/workouts';
import { z } from 'zod';

// Request validation schema
const createStrengthWorkoutSchema = z.object({
  exercises: z.array(
    z.object({
      exerciseId: z.string(),
      exerciseName: z.string(),
      sets: z.array(
        z.object({
          reps: z.number().int().positive(),
          weightKg: z.number().optional(),
          completed: z.boolean(),
        })
      ),
    })
  ).min(1),
  planId: z.string().optional(),
  durationSeconds: z.number().int().positive().max(86400),
  startedAt: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * POST /api/workouts/strength - Create a strength workout
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = createStrengthWorkoutSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { exercises, planId, durationSeconds, startedAt, notes } = validationResult.data;

    // Calculate start and end time
    const startTime = startedAt ? new Date(startedAt) : new Date(Date.now() - durationSeconds * 1000);
    const endTime = new Date(startTime.getTime() + durationSeconds * 1000);

    // Create the workout
    const workout = await createStrengthWorkout({
      userId,
      startedAt: startTime,
      endedAt: endTime,
      durationSeconds,
      exercises,
      planId,
      notes,
    });

    return NextResponse.json({ workout }, { status: 201 });
  } catch (error) {
    console.error('Error creating strength workout:', error);
    return NextResponse.json(
      { error: 'Failed to create workout' },
      { status: 500 }
    );
  }
}
