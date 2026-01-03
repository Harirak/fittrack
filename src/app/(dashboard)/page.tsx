import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="space-y-6 p-4">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user.firstName || 'FitTracker'}!
        </h1>
        <p className="text-muted-foreground">
          Ready to crush your workout today?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3">
        <Button
          asChild
          size="lg"
          className="h-auto bg-gradient-to-r from-purple-500 to-violet-600 py-6 text-lg"
        >
          <Link href="/workouts/new" className="flex items-center justify-center gap-2">
            <Plus className="h-5 w-5" />
            Start Workout
          </Link>
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            asChild
            variant="outline"
            className="h-auto py-4"
          >
            <Link href="/exercises" className="flex flex-col items-center gap-1">
              <span className="text-2xl">💪</span>
              <span className="text-sm">Browse Exercises</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto py-4"
          >
            <Link href="/plans/generate" className="flex flex-col items-center gap-1">
              <span className="text-2xl">🤖</span>
              <span className="text-sm">Generate Plan</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Empty State for Workouts */}
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <div className="mb-4 text-4xl">🏋️</div>
        <h2 className="mb-2 text-lg font-semibold">No workouts yet</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Start tracking your fitness journey by logging your first workout.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/workouts/new">Log First Workout</Link>
        </Button>
      </div>

      {/* Activity Ring Placeholder */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Daily Goals</h2>
        <div className="flex items-center justify-center">
          <div className="relative flex h-40 w-40 items-center justify-center">
            {/* Placeholder for activity ring */}
            <div className="absolute inset-0 rounded-full border-8 border-border" />
            <div className="text-center">
              <div className="text-3xl font-bold">0</div>
              <div className="text-xs text-muted-foreground">minutes today</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
