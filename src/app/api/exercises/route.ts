// API route for listing exercises
import { NextRequest, NextResponse } from 'next/server';
import { getExercises } from '@/lib/db/queries/exercises';
import type { MuscleGroup, ExerciseEquipment, Difficulty } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filter parameters
    const muscleGroups = searchParams.get('muscleGroups');
    const equipment = searchParams.get('equipment');
    const difficulty = searchParams.get('difficulty');

    const filters: {
      muscleGroups?: MuscleGroup[];
      equipment?: ExerciseEquipment[];
      difficulty?: Difficulty[];
    } = {};

    if (muscleGroups) {
      filters.muscleGroups = muscleGroups.split(',') as MuscleGroup[];
    }

    if (equipment) {
      filters.equipment = equipment.split(',') as ExerciseEquipment[];
    }

    if (difficulty) {
      filters.difficulty = difficulty.split(',') as Difficulty[];
    }

    const exercises = await getExercises(filters);

    return NextResponse.json({ exercises });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}
