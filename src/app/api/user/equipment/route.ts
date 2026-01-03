// API routes for equipment profile management
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { upsertEquipmentProfile, getEquipmentProfile } from '@/lib/db/queries/equipment';
import { z } from 'zod';

// Validation schema for equipment profile
const equipmentProfileSchema = z.object({
  dumbbells: z.boolean().default(false),
  barbells: z.boolean().default(false),
  kettlebells: z.boolean().default(false),
  bodyweight: z.boolean().default(true),
});

/**
 * GET /api/user/equipment
 * Get current user's equipment profile
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

    const profile = await getEquipmentProfile(userId);

    if (!profile) {
      // Return default profile if none exists
      return NextResponse.json({
        dumbbells: false,
        barbells: false,
        kettlebells: false,
        bodyweight: true,
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching equipment profile:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch equipment profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/equipment
 * Update current user's equipment profile
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
    const validationResult = equipmentProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid equipment profile data',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Ensure at least bodyweight is selected
    if (!data.bodyweight && !data.dumbbells && !data.barbells && !data.kettlebells) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'At least one equipment type must be selected',
        },
        { status: 400 }
      );
    }

    const profile = await upsertEquipmentProfile(userId, data);

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error updating equipment profile:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to update equipment profile' },
      { status: 500 }
    );
  }
}
