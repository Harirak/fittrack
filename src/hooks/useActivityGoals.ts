'use client';

import { useState, useEffect } from 'react';
import { GoalType, GoalProgressData } from '@/types';

interface UseActivityGoalsOptions {
  type?: GoalType;
  interval?: number; // refetch interval in ms
}

interface UseActivityGoalsResult {
  data: GoalProgressData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useActivityGoals({
  type = 'daily',
  interval = 60000, // default 1 minute
}: UseActivityGoalsOptions = {}): UseActivityGoalsResult {
  const [data, setData] = useState<GoalProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/dashboard/progress?type=${type}`);

      if (!response.ok) {
        throw new Error('Failed to fetch goal progress');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();

    if (interval > 0) {
      const intervalId = setInterval(fetchGoals, interval);
      return () => clearInterval(intervalId);
    }
  }, [type, interval]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchGoals,
  };
}

// Hook for dashboard stats
interface DashboardStats {
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

interface UseDashboardStatsResult {
  data: DashboardStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useDashboardStats(
  interval: number = 60000
): UseDashboardStatsResult {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard/stats');

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    if (interval > 0) {
      const intervalId = setInterval(fetchStats, interval);
      return () => clearInterval(intervalId);
    }
  }, [interval]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchStats,
  };
}

// Hook for weekly data
interface WeeklyDataPoint {
  date: string; // ISO date
  duration: number; // minutes
  distance: number; // km
  workoutCount: number;
}

interface UseWeeklyDataResult {
  data: WeeklyDataPoint[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useWeeklyData(
  weeks: number = 1,
  interval: number = 60000
): UseWeeklyDataResult {
  const [data, setData] = useState<WeeklyDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWeekly = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (weeks * 7));

      const response = await fetch(
        `/api/dashboard/weekly?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weekly data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeekly();

    if (interval > 0) {
      const intervalId = setInterval(fetchWeekly, interval);
      return () => clearInterval(intervalId);
    }
  }, [weeks, interval]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchWeekly,
  };
}
