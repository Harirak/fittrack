'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export type TimerState = 'idle' | 'running' | 'paused';

export interface UseWorkoutTimerReturn {
  state: TimerState;
  elapsedSeconds: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
}

export function useWorkoutTimer(): UseWorkoutTimerReturn {
  const [state, setState] = useState<TimerState>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Start the timer
  const start = useCallback(() => {
    setState('running');
    setElapsedSeconds(0);
    startTimeRef.current = Date.now();
  }, []);

  // Pause the timer
  const pause = useCallback(() => {
    if (state === 'running') {
      setState('paused');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [state]);

  // Resume the timer
  const resume = useCallback(() => {
    if (state === 'paused') {
      setState('running');
      startTimeRef.current = Date.now() - elapsedSeconds * 1000;
    }
  }, [state, elapsedSeconds]);

  // Stop the timer
  const stop = useCallback(() => {
    setState('idle');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  // Reset the timer
  const reset = useCallback(() => {
    setState('idle');
    setElapsedSeconds(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  // Update elapsed time when running
  useEffect(() => {
    if (state === 'running' && startTimeRef.current) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - (startTimeRef.current || 0)) / 1000);
        setElapsedSeconds(elapsed);
      }, 100); // Update every 100ms for smooth display

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [state]);

  return {
    state,
    elapsedSeconds,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}

// Helper function to format seconds as MM:SS
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Helper function to format seconds as HH:MM:SS
export function formatTimeWithHours(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
