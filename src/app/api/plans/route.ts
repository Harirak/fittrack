import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createPlan, getPlans } from '@/lib/db/queries/plans';
import { z } from 'zod';

// Request validation schema
const createPlanSchema = z.object({
  name: z.string().min(1).max(100),
  goal: z.enum(['build_muscle', 'lose_weight', 'general_fitness']),
  durationMinutes: z.number().int().min(15).max(60),
  exercises: z.array(
    z.object({
      exerciseId: z.string(),
      exerciseName: z.string(),
      sets: z.number().int().min(1).max(10),
      reps: z.union([z.number(), z.string()]),
      restSeconds: z.number().int().min(0).max(300),
      notes: z.string().optional(),
    })
  ).min(1).max(15),
  isAiGenerated: z.boolean().optional().default(false),
});

/**
 * GET /api/plans - Get all workout plans for current user
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plans = await getPlans();

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/plans - Create a new workout plan
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = createPlanSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const plan = await createPlan({
      userId,
      ...validationResult.data,
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}
