// Workout plan CRUD operations
import { db, schema } from '@/lib/db/index';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import type { PlanExercise } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export type CreatePlanInput = {
  userId: string;
  name: string;
  goal: string;
  durationMinutes: number;
  exercises: PlanExercise[];
  isAiGenerated?: boolean;
};

/**
 * Create a new workout plan
 */
export async function createPlan(input: CreatePlanInput) {
  const [plan] = await db
    .insert(schema.workoutPlans)
    .values({
      userId: input.userId,
      name: input.name,
      goal: input.goal as any,
      durationMinutes: input.durationMinutes,
      exercises: sql`${JSON.stringify(input.exercises)}`,
      isAiGenerated: input.isAiGenerated ?? false,
    })
    .returning();

  return plan;
}

/**
 * Get all workout plans for the current user
 */
export async function getPlans() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const plans = await db.query.workoutPlans.findMany({
    where: eq(schema.workoutPlans.userId, userId),
    orderBy: [desc(schema.workoutPlans.createdAt)],
  });

  return plans;
}

/**
 * Get a single workout plan by ID
 */
export async function getPlanById(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const plan = await db.query.workoutPlans.findFirst({
    where: eq(schema.workoutPlans.id, id),
  });

  // Verify ownership
  if (plan && plan.userId !== userId) {
    throw new Error('Forbidden');
  }

  return plan;
}

/**
 * Update a workout plan
 */
export async function updatePlan(id: string, updates: Partial<CreatePlanInput>) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  // Verify ownership first
  const existing = await getPlanById(id);
  if (!existing || existing.userId !== userId) {
    throw new Error('Plan not found or forbidden');
  }

  const updateData: any = {
    ...(updates.name && { name: updates.name }),
    ...(updates.goal && { goal: updates.goal }),
    ...(updates.durationMinutes && { durationMinutes: updates.durationMinutes }),
    ...(updates.exercises && { exercises: sql`${JSON.stringify(updates.exercises)}` }),
  };

  const [updated] = await db
    .update(schema.workoutPlans)
    .set(updateData)
    .where(eq(schema.workoutPlans.id, id))
    .returning();

  return updated;
}

/**
 * Delete a workout plan
 */
export async function deletePlan(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  // Verify ownership first
  const existing = await getPlanById(id);
  if (!existing || existing.userId !== userId) {
    throw new Error('Plan not found or forbidden');
  }

  await db.delete(schema.workoutPlans).where(eq(schema.workoutPlans.id, id));

  return { success: true };
}

/**
 * Get plan count for a user
 */
export async function getPlanCount() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const plans = await db
    .select({ count: schema.workoutPlans.id })
    .from(schema.workoutPlans)
    .where(eq(schema.workoutPlans.userId, userId));

  return plans.length;
}

/**
 * Get AI-generated plans specifically
 */
export async function getAiGeneratedPlans() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const plans = await db.query.workoutPlans.findMany({
    where: eq(schema.workoutPlans.userId, userId),
    orderBy: [desc(schema.workoutPlans.createdAt)],
  });

  return plans.filter((plan) => plan.isAiGenerated);
}
