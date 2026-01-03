import { db } from '@/lib/db/index';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { schema } from '@/lib/db/index';

export interface DashboardStats {
  totalWorkouts: number;
  totalDuration: number; // in minutes
  totalDistance: number; // in km
  currentStreak: number; // days
  weeklyAvg: number; // workouts per week
  thisWeek: {
    duration: number;
    distance: number;
    workoutCount: number;
  };
  lastWeek: {
    duration: number;
    distance: number;
    workoutCount: number;
  };
}

export interface WeeklyDataPoint {
  date: string; // ISO date
  duration: number; // minutes
  distance: number; // km
  workoutCount: number;
}

export interface GoalProgress {
  durationMinutes: number;
  distanceKm: number;
  workoutCount: number;
}

type WorkoutWithTreadmill = {
  id: string;
  type: 'treadmill' | 'strength';
  startedAt: Date;
  durationSeconds: number;
  treadmillData?: {
    distanceKm: number | null;
  } | null;
};

/**
 * Get comprehensive dashboard statistics for the current user
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  // Get all user workouts
  const userWorkouts = await db.query.workouts.findMany({
    where: eq(schema.workouts.userId, userId),
    with: {
      treadmillData: true,
    },
    orderBy: [desc(schema.workouts.startedAt)],
  }) as WorkoutWithTreadmill[];

  const totalWorkouts = userWorkouts.length;
  const totalDuration = userWorkouts.reduce((sum, w) => sum + w.durationSeconds, 0) / 60;
  const totalDistance = userWorkouts.reduce((sum, w) => {
    if (w.type === 'treadmill' && w.treadmillData?.distanceKm) {
      return sum + w.treadmillData.distanceKm;
    }
    return sum;
  }, 0);

  // Calculate current streak (consecutive days with at least one workout)
  const currentStreak = calculateStreak(userWorkouts);

  // Calculate weekly average
  const weeklyAvg = calculateWeeklyAverage(userWorkouts);

  // Get this week's data
  const thisWeekStart = getStartOfWeek(new Date());
  const thisWeekData = userWorkouts.filter(w => new Date(w.startedAt) >= thisWeekStart);
  const thisWeek = {
    duration: thisWeekData.reduce((sum, w) => sum + w.durationSeconds, 0) / 60,
    distance: thisWeekData.reduce((sum, w) => {
      if (w.type === 'treadmill' && w.treadmillData?.distanceKm) {
        return sum + w.treadmillData.distanceKm;
      }
      return sum;
    }, 0),
    workoutCount: thisWeekData.length,
  };

  // Get last week's data
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekStart);
  const lastWeekData = userWorkouts.filter(w => {
    const date = new Date(w.startedAt);
    return date >= lastWeekStart && date < lastWeekEnd;
  });
  const lastWeek = {
    duration: lastWeekData.reduce((sum, w) => sum + w.durationSeconds, 0) / 60,
    distance: lastWeekData.reduce((sum, w) => {
      if (w.type === 'treadmill' && w.treadmillData?.distanceKm) {
        return sum + w.treadmillData.distanceKm;
      }
      return sum;
    }, 0),
    workoutCount: lastWeekData.length,
  };

  return {
    totalWorkouts,
    totalDuration: Math.round(totalDuration),
    totalDistance: Math.round(totalDistance * 10) / 10,
    currentStreak,
    weeklyAvg: Math.round(weeklyAvg * 10) / 10,
    thisWeek: {
      duration: Math.round(thisWeek.duration),
      distance: Math.round(thisWeek.distance * 10) / 10,
      workoutCount: thisWeek.workoutCount,
    },
    lastWeek: {
      duration: Math.round(lastWeek.duration),
      distance: Math.round(lastWeek.distance * 10) / 10,
      workoutCount: lastWeek.workoutCount,
    },
  };
}

/**
 * Get goal progress for today/week
 */
export async function getGoalProgress(type: 'daily' | 'weekly' = 'daily'): Promise<{
  durationMinutes: { current: number; goal: number };
  distanceKm: { current: number; goal: number };
  workoutCount: { current: number; goal: number };
}> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  // Get user's activity goals
  const goal = await db.query.activityGoals.findFirst({
    where: and(eq(schema.activityGoals.userId, userId), eq(schema.activityGoals.type, type)),
  });

  const defaultGoal = {
    durationMinutes: type === 'daily' ? 30 : 150,
    distanceKm: type === 'daily' ? 3 : 20,
    workoutCount: type === 'daily' ? 1 : 4,
  };

  const goalValues = goal || defaultGoal;

  // Calculate date range
  const now = new Date();
  const startDate = type === 'daily'
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
    : getStartOfWeek(now);

  // Get workouts within the range
  const workouts = await db.query.workouts.findMany({
    where: and(
      eq(schema.workouts.userId, userId),
      gte(schema.workouts.startedAt, startDate)
    ),
    with: {
      treadmillData: true,
    },
  }) as WorkoutWithTreadmill[];

  // Calculate current values
  const durationMinutes = workouts.reduce((sum, w) => sum + w.durationSeconds, 0) / 60;
  const distanceKm = workouts.reduce((sum, w) => {
    if (w.type === 'treadmill' && w.treadmillData?.distanceKm) {
      return sum + w.treadmillData.distanceKm;
    }
    return sum;
  }, 0);
  const workoutCount = workouts.length;

  return {
    durationMinutes: {
      current: Math.round(durationMinutes),
      goal: goalValues.durationMinutes,
    },
    distanceKm: {
      current: Math.round(distanceKm * 10) / 10,
      goal: goalValues.distanceKm,
    },
    workoutCount: {
      current: workoutCount,
      goal: goalValues.workoutCount,
    },
  };
}

/**
 * Get weekly breakdown data
 */
export async function getWeeklyData(startDate: Date, endDate: Date): Promise<WeeklyDataPoint[]> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const workouts = await db.query.workouts.findMany({
    where: and(
      eq(schema.workouts.userId, userId),
      gte(schema.workouts.startedAt, startDate),
      lte(schema.workouts.startedAt, endDate)
    ),
    with: {
      treadmillData: true,
    },
    orderBy: [schema.workouts.startedAt],
  }) as WorkoutWithTreadmill[];

  // Group by date
  const dataByDate = new Map<string, WeeklyDataPoint>();

  workouts.forEach(workout => {
    const dateKey = new Date(workout.startedAt).toISOString().split('T')[0];

    if (!dataByDate.has(dateKey)) {
      dataByDate.set(dateKey, {
        date: dateKey,
        duration: 0,
        distance: 0,
        workoutCount: 0,
      });
    }

    const entry = dataByDate.get(dateKey)!;
    entry.duration += workout.durationSeconds / 60;
    entry.workoutCount += 1;

    if (workout.type === 'treadmill' && workout.treadmillData?.distanceKm) {
      entry.distance += workout.treadmillData.distanceKm;
    }
  });

  // Convert to array and sort by date
  return Array.from(dataByDate.values()).map(d => ({
    ...d,
    duration: Math.round(d.duration),
    distance: Math.round(d.distance * 10) / 10,
  })).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate current streak (consecutive days with workouts)
 */
function calculateStreak(workouts: any[]): number {
  if (workouts.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get unique workout dates
  const workoutDates = Array.from(new Set(
    workouts.map(w => {
      const date = new Date(w.startedAt);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
  )).sort((a, b) => b - a); // Sort descending

  let streak = 0;
  let checkDate = today;

  for (const workoutDate of workoutDates) {
    const diffDays = Math.floor((checkDate.getTime() - workoutDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0 || diffDays === 1) {
      streak++;
      checkDate = new Date(workoutDate);
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate weekly average of workouts
 */
function calculateWeeklyAverage(workouts: any[]): number {
  if (workouts.length === 0) return 0;

  const firstWorkout = new Date(workouts[workouts.length - 1].startedAt);
  const lastWorkout = new Date(workouts[0].startedAt);

  const daysActive = Math.max(1, Math.ceil((lastWorkout.getTime() - firstWorkout.getTime()) / (1000 * 60 * 60 * 24)));
  const weeksActive = daysActive / 7;

  return workouts.length / Math.max(1, weeksActive);
}

/**
 * Get start of week (Sunday)
 */
function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}
