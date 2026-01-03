// Seed script for FitTrack Pro MVP
import 'dotenv/config';
import { db } from '../index';
import { exercises } from '../schema';
import { exerciseSeedData } from './exercises';

async function seed() {
  console.log('Starting seed...');

  // Clear existing exercises
  await db.delete(exercises);
  console.log('Cleared existing exercises');

  // Insert exercises
  await db.insert(exercises).values(exerciseSeedData);
  console.log(`Inserted ${exerciseSeedData.length} exercises`);

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
