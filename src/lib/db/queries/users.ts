// User CRUD operations for FitTrack Pro MVP
import { db } from '../index';
import { users } from '../schema';
import { eq } from 'drizzle-orm';
import type { User } from '@/types';
import type { User as DbUser } from '../schema';

/**
 * Convert database user to app user (null -> undefined)
 */
function toAppUser(dbUser: DbUser): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name ?? undefined,
    weightKg: dbUser.weightKg ?? undefined,
    unitPreference: dbUser.unitPreference,
    fitnessLevel: dbUser.fitnessLevel,
    onboardingCompleted: dbUser.onboardingCompleted ?? false,
    createdAt: dbUser.createdAt,
    updatedAt: dbUser.updatedAt,
  };
}

/**
 * Create a new user in the database
 */
export async function createUser(data: {
  id: string;
  email: string;
  name?: string;
}): Promise<User> {
  const [user] = await db
    .insert(users)
    .values({
      id: data.id,
      email: data.email,
      name: data.name ?? null,
    })
    .returning();
  return toAppUser(user);
}

/**
 * Get a user by Clerk ID
 */
export async function getUser(userId: string): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user ? toAppUser(user) : null;
}

/**
 * Update user profile
 */
export async function updateUser(
  userId: string,
  data: Partial<{
    name: string;
    weightKg: number;
    unitPreference: 'metric' | 'imperial';
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
    onboardingCompleted: boolean;
  }>
): Promise<User | null> {
  const [user] = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();
  return user ? toAppUser(user) : null;
}

/**
 * Delete a user (for testing/cleanup)
 */
export async function deleteUser(userId: string): Promise<boolean> {
  const result = await db
    .delete(users)
    .where(eq(users.id, userId));
  return result.rowCount > 0;
}
