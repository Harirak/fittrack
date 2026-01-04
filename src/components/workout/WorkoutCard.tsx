'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Flame, Gauge, Calendar, Dumbbell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface WorkoutCardProps {
  workout: {
    id: string;
    type: 'treadmill' | 'strength';
    startedAt: Date;
    durationSeconds: number;
    treadmillData?: {
      distanceKm: number;
      avgSpeedKmh: number;
      caloriesBurned?: number;
    } | null;
    strengthData?: {
      exercises: Array<{
        exerciseName: string;
        sets: Array<{ reps: number; weightKg?: number; completed: boolean }>;
      }>;
    } | null;
    synced?: boolean;
  };
  onClick?: () => void;
}

export function WorkoutCard({ workout, onClick }: WorkoutCardProps) {
  const isTreadmill = workout.type === 'treadmill';
  const durationMinutes = Math.floor(workout.durationSeconds / 60);
  const timeAgo = formatDistanceToNow(new Date(workout.startedAt), { addSuffix: true });

  return (
    <Card
      className="border-border bg-card p-4 hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Icon and Type */}
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10`}>
            {isTreadmill ? (
              <Gauge className="h-6 w-6 text-primary" />
            ) : (
              <Dumbbell className="h-6 w-6 text-primary" />
            )}
          </div>

          <div>
            <h3 className="font-semibold text-foreground capitalize">
              {isTreadmill ? 'Treadmill' : 'Strength Training'}
            </h3>
            <p className="text-sm text-muted-foreground">{timeAgo}</p>
          </div>
        </div>

        {/* Right: Stats */}
        <div className="flex flex-col items-end gap-2">
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            {durationMinutes}m
          </Badge>

          {/* Treadmill-specific stats */}
          {isTreadmill && workout.treadmillData && (
            <div className="flex items-center gap-3 text-sm">
              {workout.treadmillData.caloriesBurned && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Flame className="h-3 w-3 text-primary" />
                  <span>{Math.round(workout.treadmillData.caloriesBurned)}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Gauge className="h-3 w-3 text-primary" />
                <span>{workout.treadmillData.distanceKm.toFixed(1)} km</span>
              </div>
            </div>
          )}

          {/* Strength-specific stats */}
          {!isTreadmill && workout.strengthData && (
            <div className="text-sm text-muted-foreground">
              {workout.strengthData.exercises.length} exercises
            </div>
          )}
        </div>
      </div>

      {/* Synced indicator */}
      {workout.synced === false && (
        <div className="mt-3 flex items-center gap-2 text-xs text-yellow-400">
          <div className="h-2 w-2 rounded-full bg-yellow-400" />
          <span>Pending sync</span>
        </div>
      )}
    </Card>
  );
}
