import { NextRequest, NextResponse } from 'next/server';
import { getGoalProgress } from '@/lib/db/queries/dashboard';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') === 'weekly' ? 'weekly' : 'daily';

    const progress = await getGoalProgress(type);
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching goal progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goal progress' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
