'use client';

import React from 'react';
import { MultiActivityRing } from '@/components/workout/ActivityRing';
import { cn } from '@/lib/utils';
import { Clock, Route, BarChart3 } from 'lucide-react';

export interface GoalProgressData {
  durationMinutes: {
    current: number;
    goal: number;
  };
  distanceKm: {
    current: number;
    goal: number;
  };
  workoutCount: {
    current: number;
    goal: number;
  };
}

interface GoalProgressProps {
  data: GoalProgressData;
  type?: 'daily' | 'weekly';
  className?: string;
  showLabels?: boolean;
}

export function GoalProgress({
  data,
  type = 'daily',
  className,
  showLabels = true,
}: GoalProgressProps) {
  const durationProgress = Math.min(data.durationMinutes.current / data.durationMinutes.goal, 1);
  const distanceProgress = Math.min(data.distanceKm.current / data.distanceKm.goal, 1);
  const workoutProgress = Math.min(data.workoutCount.current / data.workoutCount.goal, 1);

  const rings = [
    { progress: durationProgress, gradientId: 'duration' },
    { progress: distanceProgress, gradientId: 'distance' },
    { progress: workoutProgress, gradientId: 'workouts' },
  ];

  const allGoalsMet =
    durationProgress >= 1 && distanceProgress >= 1 && workoutProgress >= 1;

  const getPercentage = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground capitalize">
          {type} Goals
        </h3>
        {allGoalsMet && (
          <span className="text-xs text-green-500">All goals met! 🎉</span>
        )}
      </div>

      <div className="flex justify-center">
        <MultiActivityRing
          rings={rings}
          size={140}
          strokeWidth={10}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {getPercentage(
                data.durationMinutes.current +
                  data.distanceKm.current +
                  data.workoutCount.current,
                data.durationMinutes.goal +
                  data.distanceKm.goal +
                  data.workoutCount.goal
              )}
              <span className="text-sm">%</span>
            </div>
            <div className="text-xs text-muted-foreground">complete</div>
          </div>
        </MultiActivityRing>
      </div>

      {showLabels && (
        <div className="grid grid-cols-3 gap-2">
          <GoalItem
            icon={<Clock className="h-3 w-3" />}
            label="Time"
            current={data.durationMinutes.current}
            goal={data.durationMinutes.goal}
            unit="min"
            progress={durationProgress}
          />
          <GoalItem
            icon={<Route className="h-3 w-3" />}
            label="Distance"
            current={data.distanceKm.current}
            goal={data.distanceKm.goal}
            unit="km"
            progress={distanceProgress}
          />
          <GoalItem
            icon={<BarChart3 className="h-3 w-3" />}
            label="Workouts"
            current={data.workoutCount.current}
            goal={data.workoutCount.goal}
            unit=""
            progress={workoutProgress}
          />
        </div>
      )}
    </div>
  );
}

interface GoalItemProps {
  icon: React.ReactNode;
  label: string;
  current: number;
  goal: number;
  unit: string;
  progress: number;
}

function GoalItem({ icon, label, current, goal, unit, progress }: GoalItemProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card/50 p-2">
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-center">
        <div className="text-sm font-semibold">
          {Math.round(current)}
          <span className="text-xs text-muted-foreground">/{goal}</span>
        </div>
        <div className="text-xs text-muted-foreground">{unit}</div>
      </div>
      <div className="w-full">
        <div className="h-1 w-full overflow-hidden rounded-full bg-border">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              progress >= 1
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-purple-500 to-violet-500'
            )}
            style={{ width: `${Math.min(progress * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Simplified version for mini displays
interface GoalProgressMiniProps {
  durationProgress: number; // 0 to 1
  distanceProgress: number; // 0 to 1
  workoutProgress: number; // 0 to 1
  className?: string;
}

export function GoalProgressMini({
  durationProgress,
  distanceProgress,
  workoutProgress,
  className,
}: GoalProgressMiniProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <ProgressBar label="Time" progress={durationProgress} unit="min" />
      <ProgressBar label="Distance" progress={distanceProgress} unit="km" />
      <ProgressBar label="Workouts" progress={workoutProgress} unit="" />
    </div>
  );
}

interface ProgressBarProps {
  label: string;
  progress: number; // 0 to 1
  unit: string;
}

function ProgressBar({ label, progress, unit }: ProgressBarProps) {
  const percentage = Math.min(Math.round(progress * 100), 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-muted-foreground">{percentage}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            progress >= 1
              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
              : 'bg-gradient-to-r from-purple-500 to-violet-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
