// Application constants for FitTrack Pro MVP

// ============= Muscle Groups =============
export const MUSCLE_GROUPS = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'core',
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
] as const;

export const MUSCLE_GROUP_LABELS: Record<string, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  core: 'Core',
  quadriceps: 'Quadriceps',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
};

// ============= Equipment Types =============
export const EQUIPMENT_TYPES = [
  'bodyweight',
  'dumbbells',
  'barbells',
  'kettlebells',
] as const;

export const EQUIPMENT_LABELS: Record<string, string> = {
  bodyweight: 'Bodyweight',
  dumbbells: 'Dumbbells',
  barbells: 'Barbells',
  kettlebells: 'Kettlebells',
};

export const EQUIPMENT_ICONS: Record<string, string> = {
  bodyweight: 'person',
  dumbbells: 'dumbbell',
  barbells: 'dumbbell', // Using dumbbell icon for barbells too
  kettlebells: 'dumbbell', // Using dumbbell icon for kettlebells too
};

// ============= Difficulty Levels =============
export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-500',
  intermediate: 'bg-yellow-500',
  advanced: 'bg-red-500',
};

// ============= Goal Types =============
export const GOAL_TYPES = ['build_muscle', 'lose_weight', 'general_fitness'] as const;

export const GOAL_LABELS: Record<string, string> = {
  build_muscle: 'Build Muscle',
  lose_weight: 'Lose Weight',
  general_fitness: 'General Fitness',
};

// ============= Fitness Levels =============
export const FITNESS_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export const FITNESS_LEVEL_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

// ============= Unit Preferences =============
export const UNIT_PREFERENCES = ['metric', 'imperial'] as const;

export const UNIT_LABELS: Record<string, string> = {
  metric: 'Metric (kg, km)',
  imperial: 'Imperial (lb, mi)',
};

// ============= Goal Period Types =============
export const GOAL_PERIOD_TYPES = ['daily', 'weekly'] as const;

export const GOAL_PERIOD_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
};

// ============= Workout Durations =============
export const WORKOUT_DURATIONS = [15, 30, 45, 60] as const;

export const WORKOUT_DURATION_LABELS: Record<number, string> = {
  15: '15 minutes',
  30: '30 minutes',
  45: '45 minutes',
  60: '60 minutes',
};

// ============= Default Values =============
export const DEFAULT_DAILY_GOAL = {
  durationMinutes: 30,
  distanceKm: 3,
  workoutCount: 1,
};

export const DEFAULT_WEEKLY_GOAL = {
  durationMinutes: 150,
  distanceKm: 20,
  workoutCount: 4,
};

// ============= Pagination =============
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ============= Timer =============
export const TIMER_UPDATE_INTERVAL = 1000; // 1 second

// ============= Animation =============
export const TOAST_DURATION = 3000; // 3 seconds
export const DIALOG_ANIMATION_DURATION = 200; // 200ms
