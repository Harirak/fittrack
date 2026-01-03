// Equipment profile database queries
import { db } from '@/lib/db';
import { equipmentProfiles, type EquipmentProfile, type NewEquipmentProfile } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get equipment profile for a user
 * @param userId - Clerk user ID
 * @returns Equipment profile or null if not found
 */
export async function getEquipmentProfile(userId: string): Promise<EquipmentProfile | null> {
  const [profile] = await db
    .select()
    .from(equipmentProfiles)
    .where(eq(equipmentProfiles.userId, userId))
    .limit(1);

  return profile || null;
}

/**
 * Create a new equipment profile for a user
 * @param userId - Clerk user ID
 * @param data - Equipment profile data (userId will be overridden)
 * @returns Created equipment profile
 */
export async function createEquipmentProfile(
  userId: string,
  data: Omit<NewEquipmentProfile, 'userId' | 'id' | 'updatedAt'>
): Promise<EquipmentProfile> {
  const [profile] = await db
    .insert(equipmentProfiles)
    .values({
      userId,
      ...data,
    })
    .returning();

  return profile;
}

/**
 * Update equipment profile for a user
 * @param userId - Clerk user ID
 * @param data - Partial equipment profile data to update
 * @returns Updated equipment profile or null if not found
 */
export async function updateEquipmentProfile(
  userId: string,
  data: Partial<Omit<EquipmentProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<EquipmentProfile | null> {
  const [profile] = await db
    .update(equipmentProfiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(equipmentProfiles.userId, userId))
    .returning();

  return profile || null;
}

/**
 * Upsert equipment profile (create if doesn't exist, update if it does)
 * @param userId - Clerk user ID
 * @param data - Equipment profile data
 * @returns Equipment profile
 */
export async function upsertEquipmentProfile(
  userId: string,
  data: Omit<NewEquipmentProfile, 'userId' | 'id' | 'updatedAt'>
): Promise<EquipmentProfile> {
  const existing = await getEquipmentProfile(userId);

  if (existing) {
    const updated = await updateEquipmentProfile(userId, data);
    if (updated) {
      return updated;
    }
  }

  return createEquipmentProfile(userId, data);
}

/**
 * Delete equipment profile for a user
 * @param userId - Clerk user ID
 * @returns True if deleted, false if not found
 */
export async function deleteEquipmentProfile(userId: string): Promise<boolean> {
  const result = await db
    .delete(equipmentProfiles)
    .where(eq(equipmentProfiles.userId, userId));

  return result.rowCount > 0;
}

/**
 * Get available equipment types for a user
 * @param userId - Clerk user ID
 * @returns Array of equipment type strings that are enabled
 */
export async function getAvailableEquipment(userId: string): Promise<string[]> {
  const profile = await getEquipmentProfile(userId);

  if (!profile) {
    // Default to bodyweight only if no profile exists
    return ['bodyweight'];
  }

  const equipment: string[] = [];
  if (profile.bodyweight) equipment.push('bodyweight');
  if (profile.dumbbells) equipment.push('dumbbells');
  if (profile.barbells) equipment.push('barbells');
  if (profile.kettlebells) equipment.push('kettlebells');

  return equipment;
}
