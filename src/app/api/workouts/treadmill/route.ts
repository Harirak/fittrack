import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createTreadmillWorkout } from '@/lib/db/queries/workouts';
import { treadmillWorkoutSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate input
    const validatedData = treadmillWorkoutSchema.parse(body);

    // Calculate end time from start time and duration
    const startedAt = new Date(validatedData.startedAt || Date.now());
    const endedAt = new Date(startedAt.getTime() + validatedData.durationSeconds * 1000);

    // Create the workout
    const workout = await createTreadmillWorkout({
      userId,
      startedAt,
      endedAt,
      durationSeconds: validatedData.durationSeconds,
      distanceKm: validatedData.distanceKm,
      avgSpeedKmh: validatedData.avgSpeedKmh,
      caloriesBurned: validatedData.caloriesBurned,
      notes: validatedData.notes || undefined,
    });

    return NextResponse.json(workout, { status: 201 });
  } catch (error) {
    console.error('Error creating treadmill workout:', error);
    return NextResponse.json(
      { error: 'Failed to create workout' },
      { status: 500 }
    );
  }
}
