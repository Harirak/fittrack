'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Play, Clock, Dumbbell, Target, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { WorkoutPlan, PlanExercise } from '@/lib/db/schema';

const GOAL_CONFIG: Record<string, { label: string; color: string }> = {
  build_muscle: { label: 'Build Muscle', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  lose_weight: { label: 'Lose Weight', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  general_fitness: { label: 'General Fitness', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
};

export default function PlanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/plans/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete plan');

      toast({
        title: 'Plan deleted',
        description: 'Workout plan has been removed',
      });
      router.push('/plans');
    } catch (error) {
      toast({
        title: 'Failed to delete',
        description: 'Could not delete the workout plan',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-md mx-auto px-4 py-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const goalConfig = GOAL_CONFIG[plan.goal] || GOAL_CONFIG.general_fitness;

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
        <h1 className="text-xl font-bold flex-1">Workout Plan</h1>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isDeleting}>
              <Trash2 className="h-5 w-5 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete workout plan?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{plan.name}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Plan Details */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                {plan.isAiGenerated && (
                  <Badge variant="secondary" className="text-xs">
                    AI Generated
                  </Badge>
                )}
                <Badge className={goalConfig.color}>
                  {goalConfig.label}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{plan.durationMinutes} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Dumbbell className="h-4 w-4" />
              <span>{Array.isArray(plan.exercises) ? plan.exercises.length : 0} exercises</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercises */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Exercises</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.isArray(plan.exercises) && plan.exercises.map((exercise: PlanExercise, index: number) => (
              <div key={index}>
                {index > 0 && <Separator className="mb-4" />}
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold">{exercise.exerciseName}</h4>
                      <div className="flex flex-wrap gap-2 mt-1 text-sm text-muted-foreground">
                        <span>{exercise.sets} sets</span>
                        <span>×</span>
                        <span>{exercise.reps} reps</span>
                        {exercise.restSeconds > 0 && (
                          <>
                            <span>·</span>
                            <span>{exercise.restSeconds}s rest</span>
                          </>
                        )}
                      </div>
                      {exercise.notes && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          {exercise.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Start Workout Button */}
      <Button
        onClick={() => router.push(`/plans/${plan.id}/start`)}
        className="w-full mt-4 h-14 text-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
        size="lg"
      >
        <Play className="mr-2 h-5 w-5" />
        Start Workout
      </Button>
    </div>
  );
}
