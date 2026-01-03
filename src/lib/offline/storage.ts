/**
 * IndexedDB storage for offline workout logging
 * Handles pending workouts that need to be synced when connection restores
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

/**
 * Pending workout structure for offline storage
 */
export interface PendingWorkout {
  localId: string;
  type: 'treadmill' | 'strength';
  data: TreadmillWorkoutData | StrengthWorkoutData;
  timestamp: number;
  retryCount: number;
}

export interface TreadmillWorkoutData {
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  distanceKm: number;
  avgSpeedKmh: number;
  caloriesBurned?: number;
  notes?: string;
}

export interface StrengthWorkoutData {
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    sets: {
      reps: number;
      weightKg?: number;
      completed: boolean;
    }[];
  }[];
  planId?: string;
  notes?: string;
}

interface FitTrackDB extends DBSchema {
  pendingWorkouts: {
    key: string;
    value: PendingWorkout;
    indexes: {
      'by-timestamp': number;
    };
  };
  cachedExercises: {
    key: string;
    value: {
      id: string;
      name: string;
      description: string;
      muscleGroups: string[];
      equipment: string;
      difficulty: string;
      instructions: string;
      imageUrl?: string;
    };
  };
}

const DB_NAME = 'fittrack';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<FitTrackDB> | null = null;

/**
 * Get or create the IndexedDB instance
 */
export async function getDB(): Promise<IDBPDatabase<FitTrackDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<FitTrackDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create pending workouts store with timestamp index
      if (!db.objectStoreNames.contains('pendingWorkouts')) {
        const pendingStore = db.createObjectStore('pendingWorkouts', {
          keyPath: 'localId',
        });
        pendingStore.createIndex('by-timestamp', 'timestamp');
      }

      // Create cached exercises store
      if (!db.objectStoreNames.contains('cachedExercises')) {
        db.createObjectStore('cachedExercises', {
          keyPath: 'id',
        });
      }
    },
    blocked() {
      console.warn('[Offline Storage] DB upgrade blocked - older version open');
    },
    blocking() {
      console.warn('[Offline Storage] DB blocking other connections');
    },
  });

  return dbInstance;
}

/**
 * Save a pending workout to IndexedDB
 */
export async function savePendingWorkout(
  workout: PendingWorkout
): Promise<void> {
  try {
    const db = await getDB();
    await db.put('pendingWorkouts', workout);
    console.log('[Offline Storage] Saved pending workout:', workout.localId);
  } catch (error) {
    console.error('[Offline Storage] Failed to save pending workout:', error);
    throw error;
  }
}

/**
 * Get all pending workouts from IndexedDB
 */
export async function getPendingWorkouts(): Promise<PendingWorkout[]> {
  try {
    const db = await getDB();
    const workouts = await db.getAll('pendingWorkouts');
    console.log(`[Offline Storage] Retrieved ${workouts.length} pending workouts`);
    return workouts.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error('[Offline Storage] Failed to get pending workouts:', error);
    return [];
  }
}

/**
 * Delete a pending workout from IndexedDB (after successful sync)
 */
export async function deletePendingWorkout(localId: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('pendingWorkouts', localId);
    console.log('[Offline Storage] Deleted synced workout:', localId);
  } catch (error) {
    console.error('[Offline Storage] Failed to delete pending workout:', error);
  }
}

/**
 * Clear all pending workouts
 */
export async function clearPendingWorkouts(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear('pendingWorkouts');
    console.log('[Offline Storage] Cleared all pending workouts');
  } catch (error) {
    console.error('[Offline Storage] Failed to clear pending workouts:', error);
  }
}

/**
 * Update retry count for a pending workout
 */
export async function incrementRetryCount(localId: string): Promise<void> {
  try {
    const db = await getDB();
    const workout = await db.get('pendingWorkouts', localId);
    if (workout) {
      workout.retryCount += 1;
      await db.put('pendingWorkouts', workout);
    }
  } catch (error) {
    console.error('[Offline Storage] Failed to update retry count:', error);
  }
}

/**
 * Cache exercises for offline access
 */
export async function cacheExercises(
  exercises: Array<{
    id: string;
    name: string;
    description: string;
    muscleGroups: string[];
    equipment: string;
    difficulty: string;
    instructions: string;
    imageUrl?: string;
  }>
): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('cachedExercises', 'readwrite');
    await Promise.all([
      ...exercises.map((exercise) =>
        tx.store.put(exercise)
      ),
      tx.done,
    ]);
    console.log(`[Offline Storage] Cached ${exercises.length} exercises`);
  } catch (error) {
    console.error('[Offline Storage] Failed to cache exercises:', error);
  }
}

/**
 * Get cached exercises
 */
export async function getCachedExercises(): Promise<
  Array<{
    id: string;
    name: string;
    description: string;
    muscleGroups: string[];
    equipment: string;
    difficulty: string;
    instructions: string;
    imageUrl?: string;
  }>
> {
  try {
    const db = await getDB();
    const exercises = await db.getAll('cachedExercises');
    return exercises;
  } catch (error) {
    console.error('[Offline Storage] Failed to get cached exercises:', error);
    return [];
  }
}

/**
 * Get count of pending workouts
 */
export async function getPendingWorkoutCount(): Promise<number> {
  try {
    const db = await getDB();
    const count = await db.count('pendingWorkouts');
    return count;
  } catch (error) {
    console.error('[Offline Storage] Failed to get pending workout count:', error);
    return 0;
  }
}

/**
 * Delete old pending workouts (older than 7 days)
 */
export async function cleanupOldPendingWorkouts(): Promise<void> {
  try {
    const db = await getDB();
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const workouts = await db.getAll('pendingWorkouts');

    const tx = db.transaction('pendingWorkouts', 'readwrite');
    let deletedCount = 0;

    for (const workout of workouts) {
      if (workout.timestamp < sevenDaysAgo) {
        await tx.store.delete(workout.localId);
        deletedCount++;
      }
    }

    await tx.done;

    if (deletedCount > 0) {
      console.log(`[Offline Storage] Cleaned up ${deletedCount} old pending workouts`);
    }
  } catch (error) {
    console.error('[Offline Storage] Failed to cleanup old workouts:', error);
  }
}
