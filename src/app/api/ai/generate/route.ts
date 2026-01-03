// AI workout generation API route with rate limiting
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateWorkoutPlan } from '@/lib/ai/client';
import { isAiClientAvailable } from '@/lib/ai/client';
import { z } from 'zod';

// Rate limiting store (in-memory for MVP - use Redis for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // 10 requests per day per user
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Request validation schema
const generateRequestSchema = z.object({
  goal: z.enum(['build_muscle', 'lose_weight', 'general_fitness']),
  durationMinutes: z.enum(['15', '30', '45', '60']).transform(Number),
  equipment: z.array(z.enum(['dumbbells', 'barbells', 'kettlebells', 'bodyweight'])).min(1),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  muscleGroups: z.array(z.string()).optional(),
});

/**
 * Check rate limit for a user
 */
function checkRateLimit(userId: string): { allowed: boolean; remaining?: number } {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new limit
    rateLimitStore.set(userId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (userLimit.count >= RATE_LIMIT) {
    return { allowed: false };
  }

  userLimit.count++;
  return { allowed: true, remaining: RATE_LIMIT - userLimit.count };
}

/**
 * POST /api/ai/generate - Generate a workout plan using AI
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if AI client is available
    if (!isAiClientAvailable()) {
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    // Check rate limit
    const rateLimit = checkRateLimit(userId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `You can generate ${RATE_LIMIT} workout plans per day. Try again tomorrow.`,
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = generateRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const params = validationResult.data;

    // Generate workout plan
    const workoutPlan = await generateWorkoutPlan({
      goal: params.goal,
      durationMinutes: params.durationMinutes,
      equipment: params.equipment,
      fitnessLevel: params.fitnessLevel,
      muscleGroups: params.muscleGroups,
    });

    // Return response with rate limit info
    return NextResponse.json(
      {
        success: true,
        plan: workoutPlan,
        rateLimit: {
          remaining: rateLimit.remaining,
        },
      },
      {
        headers: {
          'X-RateLimit-Remaining': String(rateLimit.remaining ?? 0),
          'X-RateLimit-Limit': String(RATE_LIMIT),
        },
      }
    );
  } catch (error) {
    console.error('AI generation error:', error);

    // Return user-friendly error message
    return NextResponse.json(
      {
        error: 'Failed to generate workout plan',
        message:
          'We couldn\'t generate your workout plan. Please try again or browse our exercise library for inspiration.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/generate - Check AI service availability
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const available = isAiClientAvailable();
  const rateLimit = checkRateLimit(userId);

  return NextResponse.json({
    available,
    rateLimit: {
      remaining: rateLimit.remaining ?? 0,
      limit: RATE_LIMIT,
    },
  });
}
