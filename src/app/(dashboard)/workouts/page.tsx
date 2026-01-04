'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WorkoutCard } from '@/components/workout/WorkoutCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function WorkoutsPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await fetch('/api/workouts');
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data);
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutClick = (workoutId: string) => {
    router.push(`/workouts/${workoutId}`);
  };

  return (
    <div className="flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4 md:p-6">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Workouts</h1>
          <Link href="/workouts/new">
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Workout
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading workouts...</div>
          </div>
        ) : workouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-6xl mb-4">🏃</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No workouts yet</h2>
            <p className="text-muted-foreground text-center mb-6">
              Start tracking your fitness journey by logging your first workout
            </p>
            <Link href="/workouts/new">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
                <Plus className="mr-2 h-4 w-4" />
                Start Your First Workout
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {workouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={{
                  ...workout,
                  startedAt: new Date(workout.startedAt),
                }}
                onClick={() => handleWorkoutClick(workout.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
