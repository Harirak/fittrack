'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlanCard } from '@/components/plan/PlanCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Plus, Dumbbell } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { WorkoutPlan } from '@/lib/db/schema';

export default function PlansPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans');
      if (!response.ok) throw new Error('Failed to fetch plans');
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      toast({
        title: 'Failed to load plans',
        description: 'Could not load your workout plans',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/plans/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete plan');

      setPlans(plans.filter((p) => p.id !== id));
      toast({
        title: 'Plan deleted',
        description: 'Workout plan has been removed',
      });
    } catch (error) {
      toast({
        title: 'Failed to delete',
        description: 'Could not delete the workout plan',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            My Workouts
          </h1>
          <p className="text-muted-foreground mt-1">
            Your saved workout plans
          </p>
        </div>
        <Button
          onClick={() => router.push('/plans/generate')}
          size="icon"
          className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Dumbbell className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">No workout plans yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Generate an AI-powered workout or create your own
                </p>
              </div>
              <Button
                onClick={() => router.push('/plans/generate')}
                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Workout
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              id={plan.id}
              name={plan.name}
              goal={plan.goal as any}
              durationMinutes={plan.durationMinutes}
              exerciseCount={Array.isArray(plan.exercises) ? plan.exercises.length : 0}
              isAiGenerated={plan.isAiGenerated}
              onView={() => router.push(`/plans/${plan.id}`)}
              onStart={() => router.push(`/plans/${plan.id}/start`)}
              onDelete={() => handleDelete(plan.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
