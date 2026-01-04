// API routes for user profile management
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getUser, updateUser, createUser } from '@/lib/db/queries/users';
import { z } from 'zod';

// Validation schema for profile update
const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  weightKg: z.number().min(20).max(300).nullable().optional(),
  unitPreference: z.enum(['metric', 'imperial']).optional(),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  onboardingCompleted: z.boolean().optional(),
});

/**
 * Helper to ensure user exists in DB by syncing from Clerk if needed
 */
async function ensureUserExists(userId: string) {
  let user = await getUser(userId);

  if (!user) {
    // User exists in Clerk but not in DB -> Sync them
    // This is "Just-In-Time" provisioning
    try {
      const clerkUser = await currentUser();

      if (clerkUser && clerkUser.id === userId) {
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        if (email) {
          console.log(`[JIT] Creating missing user ${userId} (${email}) from Clerk data`);
          user = await createUser({
            id: userId,
            email: email,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || undefined,
          });
        }
      }
    } catch (error) {
      console.error('[JIT] Failed to sync user from Clerk:', error);
    }
  }

  return user;
}

/**
 * GET /api/user/profile
 * Get current user's profile
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

    const user = await ensureUserExists(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'Not Found', message: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile
 * Update current user's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User must be authenticated' },
        { status: 401 }
      );
    }

    // Ensure user exists before trying to update
    // This prevents foreign key violations in related tables if we tried to insert child records first
    // and also handles the 404 case for the update itself
    await ensureUserExists(userId);

    const body = await request.json();

    // Validate request body
    const validationResult = profileUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid profile data',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Handle weight conversion from imperial to metric
    let weightKg = data.weightKg;
    if (data.weightKg !== null && data.weightKg !== undefined && data.unitPreference === 'imperial') {
      // Convert lbs to kg
      const currentWeight = await getUser(userId);
      const currentUnit = currentWeight?.unitPreference ?? 'metric';
      if (currentUnit !== 'imperial' && data.unitPreference === 'imperial') {
        // User is switching to imperial, so the input was in lbs
        weightKg = data.weightKg * 0.453592;
      }
    }

    const updated = await updateUser(userId, {
      ...(data.name !== undefined && { name: data.name }),
      ...(weightKg !== undefined && weightKg !== null && { weightKg }),
      ...(data.unitPreference !== undefined && { unitPreference: data.unitPreference }),
      ...(data.fitnessLevel !== undefined && { fitnessLevel: data.fitnessLevel }),
      ...(data.onboardingCompleted !== undefined && { onboardingCompleted: data.onboardingCompleted }),
    });

    if (!updated) {
      return NextResponse.json(
        { error: 'Not Found', message: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}
