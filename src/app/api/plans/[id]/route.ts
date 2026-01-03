import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getPlanById, deletePlan, updatePlan } from '@/lib/db/queries/plans';

/**
 * GET /api/plans/[id] - Get a single workout plan by ID
 */
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const plan = await getPlanById(id);

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/plans/[id] - Delete a workout plan
 */
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    await deletePlan(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting plan:', error);

    if (error.message === 'Plan not found or forbidden') {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to delete plan' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/plans/[id] - Update a workout plan
 */
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const updated = await updatePlan(id, body);

    return NextResponse.json({ plan: updated });
  } catch (error: any) {
    console.error('Error updating plan:', error);

    if (error.message === 'Plan not found or forbidden') {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}
