'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlanExercise } from '@/lib/db/schema';

export type WorkoutGuideProps = {
  exercises: PlanExercise[];
  onComplete: (data: {
    exercises: {
      exerciseId: string;
      exerciseName: string;
      sets: {
        reps: number;
        weightKg?: number;
        completed: boolean;
      }[];
    }[];
  }) => void;
};

type ExerciseState = {
  currentIndex: number;
  currentSet: number;
  completedSets: boolean[][];
  timerRunning: boolean;
  timerSeconds: number;
  restMode: boolean;
  restSeconds: number;
};

export function WorkoutGuide({ exercises, onComplete }: WorkoutGuideProps) {
  const [state, setState] = useState<ExerciseState>({
    currentIndex: 0,
    currentSet: 0,
    completedSets: exercises.map((ex) => Array(ex.sets).fill(false)),
    timerRunning: false,
    timerSeconds: 0,
    restMode: false,
    restSeconds: 0,
  });

  const [loggedWeights, setLoggedWeights] = useState<Record<string, number>>({});
  const weightInputRef = useRef<HTMLInputElement>(null);

  const currentExercise = exercises[state.currentIndex];
  const progress = ((state.currentIndex + 1) / exercises.length) * 100;

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.timerRunning) {
      interval = setInterval(() => {
        setState((prev) => {
          if (prev.restMode) {
            if (prev.restSeconds <= 1) {
              return { ...prev, restMode: false, timerRunning: false, restSeconds: 0 };
            }
            return { ...prev, restSeconds: prev.restSeconds - 1 };
          }
          return { ...prev, timerSeconds: prev.timerSeconds + 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.timerRunning, state.restMode]);

  const toggleTimer = () => {
    setState((prev) => ({ ...prev, timerRunning: !prev.timerRunning }));
  };

  const resetTimer = () => {
    setState((prev) => ({ ...prev, timerSeconds: 0, timerRunning: false }));
  };

  const startRest = () => {
    const restTime = currentExercise.restSeconds || 60;
    setState((prev) => ({
      ...prev,
      restMode: true,
      restSeconds: restTime,
      timerRunning: true,
    }));
  };

  const completeSet = () => {
    const newCompletedSets = [...state.completedSets];
    newCompletedSets[state.currentIndex][state.currentSet] = true;

    // Check if more sets remaining
    if (state.currentSet < currentExercise.sets - 1) {
      setState({
        ...state,
        completedSets: newCompletedSets,
        currentSet: state.currentSet + 1,
        restMode: true,
        restSeconds: currentExercise.restSeconds || 60,
        timerRunning: true,
      });
    } else {
      // Move to next exercise or complete
      if (state.currentIndex < exercises.length - 1) {
        setState({
          ...state,
          completedSets: newCompletedSets,
          currentIndex: state.currentIndex + 1,
          currentSet: 0,
          restMode: false,
          timerRunning: false,
          timerSeconds: 0,
        });
      } else {
        finishWorkout(newCompletedSets);
      }
    }
  };

  const previousExercise = () => {
    if (state.currentIndex > 0) {
      setState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex - 1,
        currentSet: 0,
        restMode: false,
        timerRunning: false,
      }));
    }
  };

  const nextExercise = () => {
    if (state.currentIndex < exercises.length - 1) {
      setState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        currentSet: 0,
        restMode: false,
        timerRunning: false,
      }));
    }
  };

  const finishWorkout = (completedSets?: boolean[][]) => {
    const finalSets = completedSets || state.completedSets;

    const exerciseData = exercises.map((ex, exIndex) => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      sets: Array.from({ length: ex.sets }, (_, setIndex) => ({
        reps: typeof ex.reps === 'number' ? ex.reps : parseInt(ex.reps.split('-')[0] || '0'),
        weightKg: loggedWeights[`${exIndex}-${setIndex}`],
        completed: finalSets[exIndex]?.[setIndex] || false,
      })),
    }));

    onComplete({ exercises: exerciseData });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const setsCompleted = state.completedSets[state.currentIndex].filter(Boolean).length;
  const totalSets = currentExercise.sets;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Exercise {state.currentIndex + 1} of {exercises.length}</span>
          <span className="font-semibold">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Current Exercise */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="text-xl">{currentExercise.exerciseName}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Set {state.currentSet + 1} of {totalSets}
              </p>
            </div>
            {setsCompleted === totalSets && (
              <Badge className="bg-green-500">
                <Check className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Set Info */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="font-semibold">{currentExercise.sets}</span>
              <span className="text-muted-foreground">sets</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold">{currentExercise.reps}</span>
              <span className="text-muted-foreground">reps</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold">{currentExercise.restSeconds}s</span>
              <span className="text-muted-foreground">rest</span>
            </div>
          </div>

          {/* Weight Input */}
          <div>
            <label className="text-sm font-medium">Weight (kg) - Optional</label>
            <input
              ref={weightInputRef}
              type="number"
              className="mt-1 w-full px-3 py-2 rounded-md border bg-background"
              placeholder="Enter weight used"
              value={loggedWeights[`${state.currentIndex}-${state.currentSet}`] || ''}
              onChange={(e) => {
                const weight = parseFloat(e.target.value) || 0;
                setLoggedWeights((prev) => ({
                  ...prev,
                  [`${state.currentIndex}-${state.currentSet}`]: weight,
                }));
              }}
            />
          </div>

          {/* Rest Timer */}
          {state.restMode && (
            <Card className="bg-orange-500/10 border-orange-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-orange-500">Rest Time</p>
                  <p className="text-3xl font-bold text-orange-500 my-2">
                    {formatTime(state.restSeconds)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setState((prev) => ({ ...prev, restMode: false, timerRunning: false }))}
                  >
                    Skip Rest
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Workout Timer */}
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-1">Workout Time</p>
            <p className="text-4xl font-bold font-mono">{formatTime(state.timerSeconds)}</p>
          </div>

          {/* Set Progress */}
          <div className="flex gap-2 justify-center">
            {Array.from({ length: totalSets }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                  state.completedSets[state.currentIndex][i]
                    ? 'bg-green-500 text-white'
                    : i === state.currentSet
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={previousExercise}
          disabled={state.currentIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={nextExercise}
          disabled={state.currentIndex === exercises.length - 1}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Timer Controls */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={toggleTimer}
          className="flex-1"
        >
          {state.timerRunning ? (
            <Pause className="mr-2 h-4 w-4" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          {state.timerRunning ? 'Pause' : 'Start'} Timer
        </Button>
        <Button
          variant="outline"
          onClick={resetTimer}
          disabled={state.timerSeconds === 0}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={startRest}
          disabled={state.restMode || state.completedSets[state.currentIndex][state.currentSet]}
        >
          Start Rest
        </Button>
        <Button
          onClick={completeSet}
          className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
          disabled={state.completedSets[state.currentIndex][state.currentSet] && state.currentSet === totalSets - 1}
        >
          <Check className="mr-2 h-4 w-4" />
          Complete Set
        </Button>
      </div>

      {/* All Exercises Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Exercises</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {exercises.map((ex, i) => {
              const exCompleted = state.completedSets[i].filter(Boolean).length;
              const exTotal = ex.sets;
              return (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg',
                    i === state.currentIndex ? 'bg-primary/10' : 'bg-muted/50'
                  )}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ex.exerciseName}</p>
                    <p className="text-xs text-muted-foreground">
                      {exCompleted} of {exTotal} sets
                    </p>
                  </div>
                  {exCompleted === exTotal && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Finish Workout Button */}
      {state.currentIndex === exercises.length - 1 &&
        setsCompleted === totalSets && (
          <Button
            onClick={() => finishWorkout()}
            className="w-full h-12 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <Check className="mr-2 h-5 w-5" />
            Finish Workout
          </Button>
        )}
    </div>
  );
}
