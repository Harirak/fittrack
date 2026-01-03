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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-950 via-gray-950 to-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-white">Workouts</h1>
          <Link href="/workouts/new">
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Workout
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-white/60">Loading workouts...</div>
          </div>
        ) : workouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">🏃</div>
            <h2 className="text-xl font-semibold text-white mb-2">No workouts yet</h2>
            <p className="text-white/60 text-center mb-6">
              Start tracking your fitness journey by logging your first workout
            </p>
            <Link href="/workouts/new">
              <Button className="bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700">
                <Plus className="mr-2 h-4 w-4" />
                Start Your First Workout
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
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
