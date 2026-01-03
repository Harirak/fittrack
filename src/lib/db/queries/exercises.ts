// Exercise database queries
import { db } from '../index';
import { exercises } from '../schema';
import type { Exercise, MuscleGroup, ExerciseEquipment, Difficulty } from '@/types';
import { and, or, eq, inArray, sql } from 'drizzle-orm';

export interface ExerciseFilters {
  muscleGroups?: MuscleGroup[];
  equipment?: ExerciseEquipment[];
  difficulty?: Difficulty[];
}

export async function getExercises(filters?: ExerciseFilters): Promise<Exercise[]> {
  const conditions = [];

  if (filters?.muscleGroups && filters.muscleGroups.length > 0) {
    // Use PostgreSQL's overlap operator for array filtering
    const muscleConditions = filters.muscleGroups.map((muscle) =>
      sql`${exercises.muscleGroups} @> ARRAY[${sql.raw(`'${muscle}'`)}]`
    );
    conditions.push(or(...muscleConditions));
  }

  if (filters?.equipment && filters.equipment.length > 0) {
    conditions.push(inArray(exercises.equipment, filters.equipment));
  }

  if (filters?.difficulty && filters.difficulty.length > 0) {
    conditions.push(inArray(exercises.difficulty, filters.difficulty));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const results = await db
    .select()
    .from(exercises)
    .where(whereClause)
    .orderBy(exercises.name);

  return results as Exercise[];
}

export async function getExerciseById(id: string): Promise<Exercise | null> {
  const results = await db.select().from(exercises).where(eq(exercises.id, id)).limit(1);

  return (results[0] as Exercise) || null;
}

export async function getExercisesByEquipment(
  equipment: ExerciseEquipment[]
): Promise<Exercise[]> {
  const results = await db
    .select()
    .from(exercises)
    .where(inArray(exercises.equipment, equipment))
    .orderBy(exercises.name);

  return results as Exercise[];
}

export async function getExercisesByMuscleGroup(
  muscleGroup: MuscleGroup
): Promise<Exercise[]> {
  const results = await db
    .select()
    .from(exercises)
    .where(sql`${exercises.muscleGroups} @> ARRAY[${sql.raw(`'${muscleGroup}'`)}]`)
    .orderBy(exercises.name);

  return results as Exercise[];
}

export async function searchExercises(query: string): Promise<Exercise[]> {
  const results = await db
    .select()
    .from(exercises)
    .where(sql`${exercises.name} ILIKE ${`%${query}%`}`)
    .orderBy(exercises.name)
    .limit(20);

  return results as Exercise[];
}

// Get all unique muscle groups from exercises
export async function getAllMuscleGroups(): Promise<MuscleGroup[]> {
  const results = await db
    .selectDistinct({ muscle: sql<string>`unnest(${exercises.muscleGroups})` })
    .from(exercises)
    .orderBy(sql`unnest(${exercises.muscleGroups})`);

  return results.map((r) => r.muscle as MuscleGroup);
}

// Get all equipment types that have exercises
export async function getAllEquipmentTypes(): Promise<ExerciseEquipment[]> {
  const results = await db
    .selectDistinct({ equipment: exercises.equipment })
    .from(exercises)
    .orderBy(exercises.equipment);

  return results.map((r) => r.equipment as ExerciseEquipment);
}
