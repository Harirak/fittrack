'use client';

import { Play, Pause, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkoutTimer, formatTimeWithHours } from '@/hooks/useWorkoutTimer';

export interface WorkoutTimerProps {
  onComplete?: (durationSeconds: number) => void;
}

export function WorkoutTimer({ onComplete }: WorkoutTimerProps) {
  const { state, elapsedSeconds, start, pause, resume, stop, reset } = useWorkoutTimer();

  const handleStop = () => {
    stop();
    if (onComplete) {
      onComplete(elapsedSeconds);
    }
  };

  const isRunning = state === 'running';
  const isPaused = state === 'paused';
  const isIdle = state === 'idle';

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* Timer Display */}
      <div className="flex flex-col items-center">
        <div className="text-7xl md:text-8xl font-bold tabular-nums tracking-tight text-foreground">
          {formatTimeWithHours(elapsedSeconds)}
        </div>
        <div className="mt-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {state === 'idle' && 'Ready to Start'}
          {state === 'running' && 'Workout in Progress'}
          {state === 'paused' && 'Paused'}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4">
        {isIdle && (
          <Button
            size="lg"
            onClick={start}
            className="h-20 w-20 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
          >
            <Play className="h-8 w-8 fill-current" />
          </Button>
        )}

        {isRunning && (
          <>
            <Button
              size="lg"
              onClick={pause}
              className="h-20 w-20 rounded-full bg-amber-500 text-white shadow-lg hover:bg-amber-600"
            >
              <Pause className="h-8 w-8 fill-current" />
            </Button>

            <Button
              size="lg"
              onClick={handleStop}
              className="h-20 w-20 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600"
            >
              <Square className="h-8 w-8 fill-current" />
            </Button>
          </>
        )}

        {isPaused && (
          <>
            <Button
              size="lg"
              onClick={resume}
              className="h-20 w-20 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
            >
              <Play className="h-8 w-8 fill-current" />
            </Button>

            <Button
              size="lg"
              onClick={reset}
              variant="outline"
              className="h-20 w-20 rounded-full border-2 border-border bg-muted text-foreground hover:bg-muted/80"
            >
              <Square className="h-8 w-8" />
            </Button>
          </>
        )}
      </div>

      {/* Duration Info */}
      {!isIdle && (
        <div className="text-center text-muted-foreground">
          <p className="text-sm">
            {Math.floor(elapsedSeconds / 60)} minute{elapsedSeconds / 60 !== 1 ? 's' : ''} elapsed
          </p>
        </div>
      )}
    </div>
  );
}
