// API routes for activity goals management
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getActivityGoals,
  upsertActivityGoal,
  getDefaultGoals,
} from '@/lib/db/queries/goals';
import { z } from 'zod';

// Validation schema for activity goal
const activityGoalSchema = z.object({
  durationMinutes: z.number().min(1).max(1440).optional(),
  distanceKm: z.number().min(0).max(1000).optional(),
  workoutCount: z.number().min(1).max(365).optional(),
});

// Validation schema for batch goals update (daily + weekly)
const goalsUpdateSchema = z.object({
  daily: activityGoalSchema,
  weekly: activityGoalSchema,
});

/**
 * GET /api/user/goals
 * Get current user's activity goals (daily and weekly)
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User must be authenticated' },
        { status: 401 }
      );
    }

    const goals = await getActivityGoals(userId);

    // Return both daily and weekly goals
    const dailyGoal = goals.find((g) => g.type === 'daily');
    const weeklyGoal = goals.find((g) => g.type === 'weekly');

    // If goals don't exist, return defaults
    const defaults = getDefaultGoals();

    return NextResponse.json({
      daily: dailyGoal ?? { type: 'daily', ...defaults.daily },
      weekly: weeklyGoal ?? { type: 'weekly', ...defaults.weekly },
    });
  } catch (error) {
    console.error('Error fetching activity goals:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch activity goals' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/goals
 * Update current user's activity goals (daily and/or weekly)
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User must be authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = goalsUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid activity goals data',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Update daily goal if provided
    let dailyGoal;
    if (data.daily) {
      dailyGoal = await upsertActivityGoal(userId, 'daily', {
        durationMinutes: data.daily.durationMinutes ?? getDefaultGoals().daily.durationMinutes,
        distanceKm: data.daily.distanceKm ?? getDefaultGoals().daily.distanceKm,
        workoutCount: data.daily.workoutCount ?? getDefaultGoals().daily.workoutCount,
      });
    } else {
      dailyGoal = await getActivityGoals(userId, 'daily').then((goals) => goals[0]);
    }

    // Update weekly goal if provided
    let weeklyGoal;
    if (data.weekly) {
      weeklyGoal = await upsertActivityGoal(userId, 'weekly', {
        durationMinutes: data.weekly.durationMinutes ?? getDefaultGoals().weekly.durationMinutes,
        distanceKm: data.weekly.distanceKm ?? getDefaultGoals().weekly.distanceKm,
        workoutCount: data.weekly.workoutCount ?? getDefaultGoals().weekly.workoutCount,
      });
    } else {
      weeklyGoal = await getActivityGoals(userId, 'weekly').then((goals) => goals[0]);
    }

    return NextResponse.json({
      daily: dailyGoal ?? { type: 'daily', ...getDefaultGoals().daily },
      weekly: weeklyGoal ?? { type: 'weekly', ...getDefaultGoals().weekly },
    });
  } catch (error) {
    console.error('Error updating activity goals:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to update activity goals' },
      { status: 500 }
    );
  }
}
