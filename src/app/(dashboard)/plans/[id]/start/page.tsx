'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { WorkoutGuide } from '@/components/plan/WorkoutGuide';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Play, List } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { WorkoutPlan, PlanExercise } from '@/lib/db/schema';

export default function StartWorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime] = useState(new Date());
  const [viewMode, setViewMode] = useState<'guide' | 'list'>('guide');

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch(`/api/plans/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/plans');
            return;
          }
          throw new Error('Failed to fetch plan');
        }
        const data = await response.json();
        setPlan(data);
      } catch (error) {
        toast({
          title: 'Failed to load plan',
          description: 'Could not load the workout plan',
          variant: 'destructive',
        });
        router.push('/plans');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();
  }, [params.id, router, toast]);

  const handleComplete = async (data: { exercises: any[] }) => {
    if (!plan) return;

    const endTime = new Date();
    const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    try {
      const response = await fetch('/api/workouts/strength', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercises: data.exercises,
          planId: plan.id,
          durationSeconds,
          startedAt: startTime.toISOString(),
          notes: '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save workout');
      }

      toast({
        title: 'Workout completed!',
        description: 'Great job! Your workout has been logged.',
      });

      router.push('/workouts');
    } catch (error) {
      toast({
        title: 'Failed to save workout',
        description: 'Could not save your workout. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-md mx-auto px-4 py-6">
        <Skeleton className="h-8 w-32 mb-4" />
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Play className="h-5 w-5 text-violet-500" />
            {plan.name}
          </h1>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setViewMode(viewMode === 'guide' ? 'list' : 'guide')}
        >
          <List className="h-5 w-5" />
        </Button>
      </div>

      {/* Workout Guide */}
      {viewMode === 'guide' ? (
        <WorkoutGuide
          exercises={(Array.isArray(plan.exercises) ? plan.exercises : []) as PlanExercise[]}
          onComplete={handleComplete}
        />
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {Array.isArray(plan.exercises) && plan.exercises.map((exercise: PlanExercise, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{exercise.exerciseName}</p>
                    <p className="text-sm text-muted-foreground">
                      {exercise.sets} sets × {exercise.reps} reps
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setViewMode('guide')}
              className="w-full mt-4"
            >
              Start Guided Workout
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
