'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlanExercise } from '@/lib/db/schema';

export type StrengthLogFormProps = {
  exercises: PlanExercise[];
  onSubmit: (data: {
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
  onCancel?: () => void;
};

type SetLog = {
  reps: number;
  weightKg?: number;
  completed: boolean;
};

export function StrengthLogForm({ exercises, onSubmit, onCancel }: StrengthLogFormProps) {
  const [logs, setLogs] = useState<Record<number, SetLog[]>>(() => {
    const initial: Record<number, SetLog[]> = {};
    exercises.forEach((ex, idx) => {
      const repCount = typeof ex.reps === 'number' ? ex.reps : parseInt(ex.reps.split('-')[0] || '0');
      initial[idx] = Array.from({ length: ex.sets }, () => ({
        reps: repCount,
        weightKg: undefined,
        completed: true,
      }));
    });
    return initial;
  });

  const updateSet = (exerciseIndex: number, setIndex: number, updates: Partial<SetLog>) => {
    setLogs((prev) => ({
      ...prev,
      [exerciseIndex]: prev[exerciseIndex].map((set, i) =>
        i === setIndex ? { ...set, ...updates } : set
      ),
    }));
  };

  const addSet = (exerciseIndex: number) => {
    const lastSet = logs[exerciseIndex][logs[exerciseIndex].length - 1];
    setLogs((prev) => ({
      ...prev,
      [exerciseIndex]: [...prev[exerciseIndex], { ...lastSet }],
    }));
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    setLogs((prev) => ({
      ...prev,
      [exerciseIndex]: prev[exerciseIndex].filter((_, i) => i !== setIndex),
    }));
  };

  const toggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    setLogs((prev) => ({
      ...prev,
      [exerciseIndex]: prev[exerciseIndex].map((set, i) =>
        i === setIndex ? { ...set, completed: !set.completed } : set
      ),
    }));
  };

  const handleSubmit = () => {
    const exerciseData = exercises.map((ex, idx) => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      sets: logs[idx] || [],
    }));

    onSubmit({ exercises: exerciseData });
  };

  const isFormValid = exercises.every((_, idx) => logs[idx]?.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Log Workout</h2>
        <p className="text-sm text-muted-foreground">Record your sets, reps, and weights</p>
      </div>

      {exercises.map((exercise, exIndex) => (
        <Card key={exIndex}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <CardTitle className="text-base">{exercise.exerciseName}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {exercise.sets} sets × {exercise.reps} reps
                  {exercise.restSeconds && ` · ${exercise.restSeconds}s rest`}
                </p>
              </div>
              <Badge variant="outline">{exIndex + 1}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {logs[exIndex]?.map((set, setIndex) => (
              <div key={setIndex} className="flex items-center gap-2">
                {/* Set Number */}
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shrink-0">
                  {setIndex + 1}
                </div>

                {/* Weight Input */}
                <div className="flex-1">
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Weight (kg)"
                      value={set.weightKg || ''}
                      onChange={(e) =>
                        updateSet(exIndex, setIndex, {
                          weightKg: parseFloat(e.target.value) || undefined,
                        })
                      }
                      className={cn(
                        'pr-10',
                        !set.completed && 'opacity-50'
                      )}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      kg
                    </span>
                  </div>
                </div>

                {/* Reps Input */}
                <div className="w-20">
                  <Input
                    type="number"
                    placeholder="Reps"
                    value={set.reps}
                    onChange={(e) =>
                      updateSet(exIndex, setIndex, {
                        reps: parseInt(e.target.value) || 0,
                      })
                    }
                    className={cn(!set.completed && 'opacity-50')}
                  />
                </div>

                {/* Complete Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleSetComplete(exIndex, setIndex)}
                  className={cn(
                    'shrink-0',
                    set.completed
                      ? 'text-green-500 hover:text-green-600'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {set.completed ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                </Button>

                {/* Remove Set */}
                {logs[exIndex].length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSet(exIndex, setIndex)}
                    className="shrink-0 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            {/* Add Set Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSet(exIndex)}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Set
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
        >
          <Check className="mr-2 h-4 w-4" />
          Save Workout
        </Button>
      </div>
    </div>
  );
}
