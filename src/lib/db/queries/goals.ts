// Activity goals database queries
import { db } from '@/lib/db';
import { activityGoals, type ActivityGoal, type NewActivityGoal } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Get activity goals for a user
 * @param userId - Clerk user ID
 * @param type - Optional goal type filter
 * @returns Activity goals for the user
 */
export async function getActivityGoals(userId: string, type?: 'daily' | 'weekly'): Promise<ActivityGoal[]> {
  const conditions = type
    ? and(eq(activityGoals.userId, userId), eq(activityGoals.type, type))
    : eq(activityGoals.userId, userId);

  const goals = await db
    .select()
    .from(activityGoals)
    .where(conditions);

  return goals;
}

/**
 * Get a single activity goal for a user by type
 * @param userId - Clerk user ID
 * @param type - Goal type (daily or weekly)
 * @returns Activity goal or null if not found
 */
export async function getActivityGoal(userId: string, type: 'daily' | 'weekly'): Promise<ActivityGoal | null> {
  const [goal] = await db
    .select()
    .from(activityGoals)
    .where(and(eq(activityGoals.userId, userId), eq(activityGoals.type, type)))
    .limit(1);

  return goal || null;
}

/**
 * Create a new activity goal for a user
 * @param userId - Clerk user ID
 * @param data - Activity goal data (userId will be overridden)
 * @returns Created activity goal
 */
export async function createActivityGoal(
  userId: string,
  data: Omit<NewActivityGoal, 'userId' | 'id' | 'updatedAt'>
): Promise<ActivityGoal> {
  const [goal] = await db
    .insert(activityGoals)
    .values({
      userId,
      ...data,
    })
    .returning();

  return goal;
}

/**
 * Update activity goal for a user
 * @param userId - Clerk user ID
 * @param type - Goal type to update
 * @param data - Partial activity goal data to update
 * @returns Updated activity goal or null if not found
 */
export async function updateActivityGoal(
  userId: string,
  type: 'daily' | 'weekly',
  data: Partial<Omit<ActivityGoal, 'id' | 'userId' | 'type' | 'createdAt' | 'updatedAt'>>
): Promise<ActivityGoal | null> {
  const [goal] = await db
    .update(activityGoals)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(activityGoals.userId, userId), eq(activityGoals.type, type)))
    .returning();

  return goal || null;
}

/**
 * Upsert activity goal (create if doesn't exist, update if it does)
 * @param userId - Clerk user ID
 * @param type - Goal type
 * @param data - Activity goal data
 * @returns Activity goal
 */
export async function upsertActivityGoal(
  userId: string,
  type: 'daily' | 'weekly',
  data: Omit<NewActivityGoal, 'userId' | 'type' | 'id' | 'updatedAt'>
): Promise<ActivityGoal> {
  const existing = await getActivityGoal(userId, type);

  if (existing) {
    const updated = await updateActivityGoal(userId, type, data);
    if (updated) {
      return updated;
    }
  }

  return createActivityGoal(userId, { type, ...data });
}

/**
 * Delete activity goal for a user
 * @param userId - Clerk user ID
 * @param type - Goal type to delete
 * @returns True if deleted, false if not found
 */
export async function deleteActivityGoal(userId: string, type: 'daily' | 'weekly'): Promise<boolean> {
  const result = await db
    .delete(activityGoals)
    .where(and(eq(activityGoals.userId, userId), eq(activityGoals.type, type)));

  return result.rowCount > 0;
}

/**
 * Get default goals for a new user
 * @returns Object with default daily and weekly goals
 */
export function getDefaultGoals() {
  return {
    daily: {
      durationMinutes: 30,
      distanceKm: 3,
      workoutCount: 1,
    },
    weekly: {
      durationMinutes: 150,
      distanceKm: 20,
      workoutCount: 4,
    },
  };
}
