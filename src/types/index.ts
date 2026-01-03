// Core type definitions for FitTrack Pro MVP

// ============= User Types =============
export type UnitPreference = 'metric' | 'imperial';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export interface User {
  id: string; // Clerk user ID
  email: string;
  name?: string;
  weightKg?: number;
  unitPreference: UnitPreference;
  fitnessLevel: FitnessLevel;
  createdAt: Date;
  updatedAt: Date;
}

// ============= Equipment Types =============
export type EquipmentType = 'dumbbells' | 'barbells' | 'kettlebells' | 'bodyweight';

export interface EquipmentProfile {
  id: string;
  userId: string;
  dumbbells: boolean;
  barbells: boolean;
  kettlebells: boolean;
  bodyweight: boolean;
  updatedAt: Date;
}

// ============= Workout Types =============
export type WorkoutType = 'treadmill' | 'strength';

export interface Workout {
  id: string;
  userId: string;
  type: WorkoutType;
  startedAt: Date;
  endedAt: Date | null;
  durationSeconds: number;
  notes: string | null;
  synced: boolean;
  localId: string | null;
  createdAt: Date;
}

export interface TreadmillWorkout extends Workout {
  type: 'treadmill';
  treadmillData: {
    distanceKm: number;
    avgSpeedKmh: number;
    caloriesBurned: number | null;
  };
}

export interface StrengthWorkout extends Workout {
  type: 'strength';
  strengthData: {
    exercises: StrengthExerciseLog[];
    planId: string | null;
  };
}

export interface StrengthExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: {
    reps: number;
    weightKg?: number;
    completed: boolean;
  }[];
}

// ============= Exercise Types =============
export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves';

export type ExerciseEquipment = 'bodyweight' | 'dumbbells' | 'barbells' | 'kettlebells';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroups: MuscleGroup[];
  equipment: ExerciseEquipment;
  difficulty: Difficulty;
  instructions: string;
  imageUrl?: string;
}

// ============= Workout Plan Types =============
export type Goal = 'build_muscle' | 'lose_weight' | 'general_fitness';

export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  goal: Goal;
  durationMinutes: number;
  exercises: PlanExercise[];
  isAiGenerated: boolean;
  createdAt: Date;
}

export interface PlanExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number | string; // "12" or "8-12" or "30 seconds"
  restSeconds: number;
  notes?: string;
}

// ============= Activity Goals Types =============
export type GoalType = 'daily' | 'weekly';

export interface ActivityGoal {
  id: string;
  userId: string;
  type: GoalType;
  durationMinutes: number;
  distanceKm: number;
  workoutCount: number;
  updatedAt: Date;
}

// ============= API Request/Response Types =============
export interface CreateTreadmillWorkoutRequest {
  distanceKm: number;
  durationSeconds: number;
  startedAt?: string;
  notes?: string;
}

export interface CreateStrengthWorkoutRequest {
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
  durationSeconds: number;
  startedAt?: string;
  notes?: string;
}

export interface UpdateEquipmentRequest {
  dumbbells?: boolean;
  barbells?: boolean;
  kettlebells?: boolean;
}

export interface UpdateUserProfileRequest {
  weightKg?: number;
  unitPreference?: UnitPreference;
  fitnessLevel?: FitnessLevel;
}

export interface UpdateActivityGoalRequest {
  durationMinutes?: number;
  distanceKm?: number;
  workoutCount?: number;
}

export interface GenerateWorkoutPlanRequest {
  goal: Goal;
  durationMinutes: 15 | 30 | 45 | 60;
  equipment: EquipmentType[];
  fitnessLevel: FitnessLevel;
}

export interface DashboardStats {
  totalWorkouts: number;
  totalDuration: number; // in minutes
  totalDistance: number; // in km
  currentStreak: number; // days
  weeklyAvg: number; // workouts per week
}

export interface WeeklyData {
  date: string; // ISO date
  duration: number; // minutes
  distance: number; // km
  workoutCount: number;
}

// ============= Offline Sync Types =============
export interface OfflineWorkout {
  localId: string;
  type: WorkoutType;
  data: CreateTreadmillWorkoutRequest | CreateStrengthWorkoutRequest;
  createdAt: string;
}

// ============= Timer Types =============
export interface TimerState {
  status: 'idle' | 'running' | 'paused' | 'stopped';
  elapsedSeconds: number;
  startedAt: number | null;
  lastPausedAt: number | null;
}
