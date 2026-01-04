'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsCard } from './StatsCard';
import { WeeklyChart, MultiMetricChart, type WeeklyDataPoint } from './WeeklyChart';
import { GoalProgress } from './GoalProgress';
import { useDashboardStats, useWeeklyData, useActivityGoals } from '@/hooks/useActivityGoals';
import { Flame, TrendingUp, Timer, Route } from 'lucide-react';

interface DashboardClientProps {
  initialHasWorkouts: boolean;
}

export function DashboardClient({ initialHasWorkouts }: DashboardClientProps) {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: weeklyData, isLoading: weeklyLoading } = useWeeklyData(2);
  const { data: dailyGoals, isLoading: goalsLoading } = useActivityGoals({ type: 'daily' });
  const [selectedWeek, setSelectedWeek] = useState(0);

  // Handle week navigation
  const handleWeekChange = (direction: 'prev' | 'next') => {
    setSelectedWeek(prev => Math.max(0, prev + (direction === 'next' ? 1 : -1)));
  };

  // Calculate date range for selected week
  const getWeekDateRange = () => {
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay()); // Start from Sunday
    currentWeekStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(weekStart.getDate() - (selectedWeek * 7));

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return { weekStart, weekEnd };
  };

  const { weekStart, weekEnd } = getWeekDateRange();
  const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  // Filter weekly data for selected week
  const getSelectedWeekData = (): WeeklyDataPoint[] => {
    if (!weeklyData) return [];
    return weeklyData.filter(d => {
      const date = new Date(d.date);
      return date >= weekStart && date <= weekEnd;
    });
  };

  const selectedWeekData = getSelectedWeekData();

  // Calculate trends
  const getTrend = (thisWeek: number, lastWeek: number) => {
    if (lastWeek === 0) return null;
    const change = ((thisWeek - lastWeek) / lastWeek) * 100;
    return Math.round(change);
  };

  const durationTrend = stats ? getTrend(stats.thisWeek.duration, stats.lastWeek.duration) : null;
  const distanceTrend = stats ? getTrend(stats.thisWeek.distance, stats.lastWeek.distance) : null;
  const workoutsTrend = stats ? getTrend(stats.thisWeek.workoutCount, stats.lastWeek.workoutCount) : null;

  // Check if user has any workouts
  const hasWorkouts = initialHasWorkouts || (stats && stats.totalWorkouts > 0);

  if (statsLoading && !stats) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track your progress and crush your goals
        </p>
      </div>

      {/* Quick Actions - Only show if no workouts */}
      {!hasWorkouts && (
        <div className="grid gap-3">
          <Button
            asChild
            size="lg"
            className="h-auto bg-primary py-6 text-lg text-primary-foreground hover:bg-primary/90 shadow-md"
          >
            <a href="/workouts/new" className="flex items-center justify-center gap-2">
              <span className="text-2xl">💪</span>
              Start Your First Workout
            </a>
          </Button>
        </div>
      )}

      {/* Stats Cards - Responsive Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats && (
          <>
            <StatsCard
              label="Total Workouts"
              value={stats.totalWorkouts}
              trend={workoutsTrend !== null ? { value: workoutsTrend, period: 'vs last week' } : undefined}
              icon={<Flame className="h-5 w-5 text-orange-500" />}
            />
            <StatsCard
              label="Total Duration"
              value={stats.totalDuration}
              unit="min"
              trend={durationTrend !== null ? { value: durationTrend, period: 'vs last week' } : undefined}
              icon={<Timer className="h-5 w-5 text-primary" />}
            />
            <StatsCard
              label="Total Distance"
              value={stats.totalDistance}
              unit="km"
              trend={distanceTrend !== null ? { value: distanceTrend, period: 'vs last week' } : undefined}
              icon={<Route className="h-5 w-5 text-cyan-500" />}
            />
            <StatsCard
              label="Current Streak"
              value={stats.currentStreak}
              unit="days"
              icon={<TrendingUp className="h-5 w-5 text-green-500" />}
            />
          </>
        )}
      </div>

      {/* Daily Goal Progress */}
      <div className="rounded-lg border border-border bg-card p-4">
        {goalsLoading ? (
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
        ) : dailyGoals ? (
          <GoalProgress data={dailyGoals} type="daily" />
        ) : null}
      </div>

      {/* Weekly Chart with Navigation */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Weekly Activity</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleWeekChange('prev')}
              disabled={selectedWeek >= 4}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{weekLabel}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleWeekChange('next')}
              disabled={selectedWeek === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {weeklyLoading ? (
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
        ) : selectedWeekData.length > 0 ? (
          <MultiMetricChart data={selectedWeekData} />
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No workouts this week yet
          </div>
        )}
      </div>

      {/* Quick Links - Responsive */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button
          asChild
          variant="outline"
          className="h-auto py-4"
        >
          <a href="/exercises" className="flex flex-col items-center gap-1">
            <span className="text-2xl">💪</span>
            <span className="text-sm">Browse Exercises</span>
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-auto py-4"
        >
          <a href="/plans/generate" className="flex flex-col items-center gap-1">
            <span className="text-2xl">🤖</span>
            <span className="text-sm">Generate Plan</span>
          </a>
        </Button>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <div className="h-7 w-32 animate-pulse rounded bg-muted" />
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-lg bg-muted" />
      <div className="h-48 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
