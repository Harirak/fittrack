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
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4 p-4 md:p-6">
          <div className="flex items-center gap-4">
            <Link href="/workouts">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-foreground">New Workout</h1>
          </div>

          {/* Offline indicator */}
          {!isOnline && (
            <div className="flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 border border-amber-300">
              <CloudOff className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6">
        {step === 'select' && (
          <div className="flex flex-col gap-4 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-foreground">Select Workout Type</h2>

            <button
              onClick={() => setStep('timer')}
              className="flex items-center gap-4 rounded-xl border-2 border-primary/30 bg-primary/5 p-6 text-left transition-all hover:bg-primary/10 hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-green-600">
                <span className="text-3xl">🏃</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">Treadmill</h3>
                <p className="text-sm text-muted-foreground">Track your running or walking sessions</p>
              </div>
            </button>

            <button
              disabled
              className="flex items-center gap-4 rounded-xl border-2 border-border bg-muted/30 p-6 text-left opacity-60 cursor-not-allowed"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500">
                <span className="text-3xl">💪</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">Strength Training</h3>
                <p className="text-sm text-muted-foreground">Coming soon</p>
              </div>
            </button>
          </div>
        )}

        {step === 'timer' && (
          <div className="flex flex-col items-center justify-center max-w-md mx-auto">
            <WorkoutTimer onComplete={handleTimerComplete} />
          </div>
        )}

        {step === 'complete' && (
          <div className="flex max-w-md flex-col items-center mx-auto">
            {/* Save Status Messages */}
            {saveStatus === 'saving' && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-100 border border-blue-300 px-4 py-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                <span className="text-sm font-medium text-blue-700">Saving workout...</span>
              </div>
            )}

            {saveStatus === 'saved' && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-100 border border-green-300 px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Workout saved!</span>
              </div>
            )}

            {saveStatus === 'offline' && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-100 border border-amber-300 px-4 py-3">
                <CloudOff className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">
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
