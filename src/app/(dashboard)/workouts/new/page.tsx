'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WorkoutTimer } from '@/components/workout/WorkoutTimer';
import { TreadmillForm } from '@/components/workout/TreadmillForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CloudOff, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useOnlineStatus } from '@/hooks/useOfflineSync';

type Step = 'select' | 'timer' | 'complete';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'offline';

export default function NewWorkoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('select');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const isOnline = useOnlineStatus();

  const handleTimerComplete = (elapsedSeconds: number) => {
    setDurationSeconds(elapsedSeconds);
    setStep('complete');
  };

  const handleSaveWorkout = async (data: {
    distanceKm: number;
    avgSpeedKmh: number;
    caloriesBurned: number;
  }) => {
    setSaveStatus('saving');

    const workoutData = {
      durationSeconds,
      startedAt: new Date(Date.now() - durationSeconds * 1000).toISOString(),
      distanceKm: data.distanceKm,
      avgSpeedKmh: data.avgSpeedKmh,
      caloriesBurned: data.caloriesBurned,
    };

    // Generate local ID for offline tracking
    const localId = crypto.randomUUID();

    if (isOnline) {
      // Online: Try to save directly to server
      try {
        const response = await fetch('/api/workouts/treadmill', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(workoutData),
        });

        if (response.ok) {
          setSaveStatus('saved');
          setTimeout(() => {
            router.push('/workouts');
          }, 500);
        } else {
          console.error('Failed to save workout:', response.statusText);
          // Fall back to offline storage
          await saveOffline(localId, workoutData);
        }
      } catch (error) {
        console.error('Error saving workout:', error);
        // Fall back to offline storage
        await saveOffline(localId, workoutData);
      }
    } else {
      // Offline: Save to IndexedDB
      await saveOffline(localId, workoutData);
    }
  };

  const saveOffline = async (localId: string, workoutData: Record<string, unknown>) => {
    try {
      const { savePendingWorkout } = await import('@/lib/offline/storage');

      await savePendingWorkout({
        localId,
        type: 'treadmill',
        data: {
          startedAt: workoutData.startedAt as string,
          durationSeconds: workoutData.durationSeconds as number,
          distanceKm: workoutData.distanceKm as number,
          avgSpeedKmh: workoutData.avgSpeedKmh as number,
          caloriesBurned: workoutData.caloriesBurned as number | undefined,
        },
        timestamp: Date.now(),
        retryCount: 0,
      });

      setSaveStatus('offline');
      setTimeout(() => {
        router.push('/workouts');
      }, 1500);
    } catch (error) {
      console.error('Failed to save workout offline:', error);
      setSaveStatus('idle');
      alert('Failed to save workout. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-950 via-gray-950 to-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-4">
            <Link href="/workouts">
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-white">New Workout</h1>
          </div>

          {/* Offline indicator */}
          {!isOnline && (
            <div className="flex items-center gap-2 rounded-full bg-yellow-500/20 px-3 py-1.5">
              <CloudOff className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Offline</span>
            </div>
          )}
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
            {/* Save Status Messages */}
            {saveStatus === 'saving' && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-500/20 px-4 py-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                <span className="text-sm font-medium text-blue-400">Saving workout...</span>
              </div>
            )}

            {saveStatus === 'saved' && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-500/20 px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Workout saved!</span>
              </div>
            )}

            {saveStatus === 'offline' && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-yellow-500/20 px-4 py-3">
                <CloudOff className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">
                  Saved offline. Will sync when connected.
                </span>
              </div>
            )}

            <TreadmillForm
              durationSeconds={durationSeconds}
              onComplete={handleSaveWorkout}
              onCancel={() => setStep('timer')}
              disabled={saveStatus !== 'idle'}
            />
          </div>
        )}
      </div>
    </div>
  );
}
