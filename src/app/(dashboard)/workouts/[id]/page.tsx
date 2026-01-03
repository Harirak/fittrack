'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, Flame, Gauge, Dumbbell } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function WorkoutDetailPage() {
  const router = useRouter();
  const params = useParams();
  const workoutId = params.id as string;
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workoutId) {
      fetchWorkout();
    }
  }, [workoutId]);

  const fetchWorkout = async () => {
    try {
      const response = await fetch(`/api/workouts/${workoutId}`);
      if (response.ok) {
        const data = await response.json();
        setWorkout(data);
      } else {
        router.push('/workouts');
      }
    } catch (error) {
      console.error('Error fetching workout:', error);
      router.push('/workouts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-950 via-gray-950 to-black">
        <div className="text-white/60">Loading workout...</div>
      </div>
    );
  }

  if (!workout) {
    return null;
  }

  const isTreadmill = workout.type === 'treadmill';
  const durationMinutes = Math.floor(workout.durationSeconds / 60);
  const durationSeconds = workout.durationSeconds % 60;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-950 via-gray-950 to-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-4 p-4">
          <Link href="/workouts">
            <Button variant="ghost" size="icon" className="text-white/80 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-white">Workout Details</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <div className="flex max-w-md flex-col gap-6">
          {/* Workout Type Header */}
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
              isTreadmill
                ? 'bg-gradient-to-br from-purple-500/20 to-violet-500/20'
                : 'bg-gradient-to-br from-orange-500/20 to-red-500/20'
            }`}>
              {isTreadmill ? (
                <Gauge className="h-8 w-8 text-purple-400" />
              ) : (
                <Dumbbell className="h-8 w-8 text-orange-400" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white capitalize">
                {isTreadmill ? 'Treadmill' : 'Strength Training'}
              </h2>
              <p className="text-white/60">
                {format(new Date(workout.startedAt), 'MMMM d, yyyy • h:mm a')}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm p-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Duration */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white/60">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Duration</span>
                </div>
                <p className="text-2xl font-semibold text-white">
                  {durationMinutes}:{durationSeconds.toString().padStart(2, '0')}
                </p>
              </div>

              {/* Calories */}
              {isTreadmill && workout.treadmillData?.caloriesBurned && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-white/60">
                    <Flame className="h-4 w-4 text-orange-400" />
                    <span className="text-sm">Calories</span>
                  </div>
                  <p className="text-2xl font-semibold text-white">
                    {Math.round(workout.treadmillData.caloriesBurned)}
                  </p>
                </div>
              )}

              {/* Distance */}
              {isTreadmill && workout.treadmillData && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-white/60">
                    <Gauge className="h-4 w-4 text-purple-400" />
                    <span className="text-sm">Distance</span>
                  </div>
                  <p className="text-2xl font-semibold text-white">
                    {workout.treadmillData.distanceKm.toFixed(2)} km
                  </p>
                </div>
              )}

              {/* Speed */}
              {isTreadmill && workout.treadmillData && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-white/60">
                    <Gauge className="h-4 w-4 text-purple-400" />
                    <span className="text-sm">Avg Speed</span>
                  </div>
                  <p className="text-2xl font-semibold text-white">
                    {workout.treadmillData.avgSpeedKmh.toFixed(1)} km/h
                  </p>
                </div>
              )}

              {/* Exercise Count */}
              {!isTreadmill && workout.strengthData && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-white/60">
                    <Dumbbell className="h-4 w-4 text-orange-400" />
                    <span className="text-sm">Exercises</span>
                  </div>
                  <p className="text-2xl font-semibold text-white">
                    {workout.strengthData.exercises.length}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Notes */}
          {workout.notes && (
            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm p-6">
              <h3 className="text-sm font-medium text-white/80 mb-2">Notes</h3>
              <p className="text-white">{workout.notes}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
