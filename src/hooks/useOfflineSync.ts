/**
 * Hook for offline detection and automatic workout synchronization
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface OfflineSyncState {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  syncError: string | null;
}

export interface UseOfflineSyncOptions {
  onSyncComplete?: (synced: number, failed: number) => void;
  syncInterval?: number; // milliseconds, default 30000 (30 seconds)
  enableAutoSync?: boolean;
}

/**
 * Hook to detect online/offline status and manage workout sync
 */
export function useOfflineSync(options: UseOfflineSyncOptions = {}) {
  const {
    onSyncComplete,
    syncInterval = 30000,
    enableAutoSync = true,
  } = options;

  const [state, setState] = useState<OfflineSyncState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingCount: 0,
    isSyncing: false,
    syncError: null,
  });

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update pending count from IndexedDB
  const updatePendingCount = useCallback(async () => {
    try {
      const { getPendingWorkoutCount } = await import('@/lib/offline/storage');
      const count = await getPendingWorkoutCount();
      setState((prev) => ({ ...prev, pendingCount: count }));
    } catch (error) {
      console.error('[useOfflineSync] Failed to get pending count:', error);
    }
  }, []);

  // Sync pending workouts to server
  const syncPendingWorkouts = useCallback(async () => {
    if (!state.isOnline || state.isSyncing) {
      return;
    }

    setState((prev) => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      const { getPendingWorkouts, deletePendingWorkout, incrementRetryCount } =
        await import('@/lib/offline/storage');

      const pendingWorkouts = await getPendingWorkouts();

      if (pendingWorkouts.length === 0) {
        setState((prev) => ({ ...prev, isSyncing: false }));
        return;
      }

      console.log(`[useOfflineSync] Syncing ${pendingWorkouts.length} pending workouts...`);

      // Group workouts by type for batch API calls
      const treadmillWorkouts = pendingWorkouts.filter((w) => w.type === 'treadmill');
      const strengthWorkouts = pendingWorkouts.filter((w) => w.type === 'strength');

      let synced = 0;
      let failed = 0;

      // Sync treadmill workouts
      if (treadmillWorkouts.length > 0) {
        try {
          const response = await fetch('/api/workouts/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workouts: treadmillWorkouts.map((w) => ({
                localId: w.localId,
                type: 'treadmill',
                ...w.data,
              })),
            }),
          });

          if (response.ok) {
            const result = await response.json();
            synced += result.synced || 0;
            failed += result.failed || 0;

            // Delete successfully synced workouts
            for (const workout of treadmillWorkouts) {
              if (
                !result.errors?.some((e: { localId: string }) => e.localId === workout.localId)
              ) {
                await deletePendingWorkout(workout.localId);
              }
            }
          } else {
            failed += treadmillWorkouts.length;
          }
        } catch (error) {
          console.error('[useOfflineSync] Failed to sync treadmill workouts:', error);
          failed += treadmillWorkouts.length;

          // Increment retry count for failed workouts
          for (const workout of treadmillWorkouts) {
            await incrementRetryCount(workout.localId);
          }
        }
      }

      // Sync strength workouts
      if (strengthWorkouts.length > 0) {
        try {
          const response = await fetch('/api/workouts/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workouts: strengthWorkouts.map((w) => ({
                localId: w.localId,
                type: 'strength',
                ...w.data,
              })),
            }),
          });

          if (response.ok) {
            const result = await response.json();
            synced += result.synced || 0;
            failed += result.failed || 0;

            // Delete successfully synced workouts
            for (const workout of strengthWorkouts) {
              if (
                !result.errors?.some((e: { localId: string }) => e.localId === workout.localId)
              ) {
                await deletePendingWorkout(workout.localId);
              }
            }
          } else {
            failed += strengthWorkouts.length;
          }
        } catch (error) {
          console.error('[useOfflineSync] Failed to sync strength workouts:', error);
          failed += strengthWorkouts.length;

          // Increment retry count for failed workouts
          for (const workout of strengthWorkouts) {
            await incrementRetryCount(workout.localId);
          }
        }
      }

      // Update pending count after sync
      await updatePendingCount();

      // Call completion callback
      if (onSyncComplete) {
        onSyncComplete(synced, failed);
      }

      if (failed > 0) {
        setState((prev) => ({
          ...prev,
          syncError: `${failed} workout(s) failed to sync. Will retry automatically.`,
        }));
      }
    } catch (error) {
      console.error('[useOfflineSync] Sync error:', error);
      setState((prev) => ({
        ...prev,
        syncError: error instanceof Error ? error.message : 'Sync failed',
      }));
    } finally {
      setState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [state.isOnline, state.isSyncing, onSyncComplete, updatePendingCount]);

  // Handle online status change
  useEffect(() => {
    const handleOnline = () => {
      console.log('[useOfflineSync] Connection restored');
      setState((prev) => ({ ...prev, isOnline: true, syncError: null }));

      // Trigger sync when coming back online
      if (enableAutoSync) {
        syncPendingWorkouts();
      }
    };

    const handleOffline = () => {
      console.log('[useOfflineSync] Connection lost');
      setState((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enableAutoSync, syncPendingWorkouts]);

  // Periodic sync when online
  useEffect(() => {
    if (!enableAutoSync || !state.isOnline) {
      return;
    }

    // Initial sync check
    updatePendingCount();

    // Set up periodic sync
    syncIntervalRef.current = setInterval(() => {
      if (state.isOnline && state.pendingCount > 0) {
        syncPendingWorkouts();
      }
    }, syncInterval);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [enableAutoSync, state.isOnline, state.pendingCount, syncInterval, syncPendingWorkouts, updatePendingCount]);

  // Manual sync trigger
  const manualSync = useCallback(() => {
    return syncPendingWorkouts();
  }, [syncPendingWorkouts]);

  return {
    ...state,
    syncPendingWorkouts: manualSync,
    updatePendingCount,
  };
}

/**
 * Simpler hook that just tracks online/offline status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
