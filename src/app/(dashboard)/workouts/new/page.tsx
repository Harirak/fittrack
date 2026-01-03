'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WorkoutTimer } from '@/components/workout/WorkoutTimer';
import { TreadmillForm } from '@/components/workout/TreadmillForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Step = 'select' | 'timer' | 'complete';

export default function NewWorkoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('select');
  const [durationSeconds, setDurationSeconds] = useState(0);

  const handleTimerComplete = (elapsedSeconds: number) => {
    setDurationSeconds(elapsedSeconds);
    setStep('complete');
  };

  const handleSaveWorkout = async (data: {
    distanceKm: number;
    avgSpeedKmh: number;
    caloriesBurned: number;
  }) => {
    try {
      const response = await fetch('/api/workouts/treadmill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          durationSeconds,
          startedAt: new Date(Date.now() - durationSeconds * 1000).toISOString(),
          distanceKm: data.distanceKm,
          avgSpeedKmh: data.avgSpeedKmh,
          caloriesBurned: data.caloriesBurned,
        }),
      });

      if (response.ok) {
        router.push('/workouts');
      } else {
        console.error('Failed to save workout');
      }
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  };

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
          <h1 className="text-lg font-semibold text-white">New Workout</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {step === 'select' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-white">Select Workout Type</h2>

            <button
              onClick={() => setStep('timer')}
              className="flex items-center gap-4 rounded-xl border border-purple-500/30 bg-purple-500/10 p-6 text-left transition-colors hover:bg-purple-500/20"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600">
                <span className="text-3xl">🏃</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Treadmill</h3>
                <p className="text-sm text-white/60">Track your running or walking sessions</p>
              </div>
            </button>

            <button
              disabled
              className="flex items-center gap-4 rounded-xl border border-gray-700 bg-gray-800/30 p-6 text-left opacity-50"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600">
                <span className="text-3xl">💪</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Strength Training</h3>
                <p className="text-sm text-white/60">Coming soon</p>
              </div>
            </button>
          </div>
        )}

        {step === 'timer' && (
          <div className="flex flex-col items-center justify-center">
            <WorkoutTimer onComplete={handleTimerComplete} />
          </div>
        )}

        {step === 'complete' && (
          <div className="flex max-w-md flex-col items-center">
            <TreadmillForm
              durationSeconds={durationSeconds}
              onComplete={handleSaveWorkout}
              onCancel={() => setStep('timer')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
