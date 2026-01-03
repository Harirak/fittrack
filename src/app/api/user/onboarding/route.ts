// API route to mark onboarding as complete
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { updateUser } from '@/lib/db/queries/users';

/**
 * POST /api/user/onboarding
 * Mark user's onboarding as complete
 */
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User must be authenticated' },
        { status: 401 }
      );
    }

    // Mark onboarding as complete
    const updated = await updateUser(userId, { onboardingCompleted: true });

    if (!updated) {
      return NextResponse.json(
        { error: 'Not Found', message: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking onboarding complete:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to mark onboarding complete' },
      { status: 500 }
    );
  }
}
