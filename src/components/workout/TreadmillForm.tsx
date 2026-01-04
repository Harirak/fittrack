'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { estimateCalories } from '@/lib/calories';
import { Flame, Gauge, Clock } from 'lucide-react';

export interface TreadmillFormProps {
  durationSeconds: number;
  onComplete: (data: { distanceKm: number; avgSpeedKmh: number; caloriesBurned: number }) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export function TreadmillForm({ durationSeconds, onComplete, onCancel, disabled }: TreadmillFormProps) {
  const [distanceKm, setDistanceKm] = useState('');
  const [userWeightKg, setUserWeightKg] = useState('70');

  // Calculate derived values
  const durationHours = durationSeconds / 3600;
  const avgSpeedKmh = durationHours > 0 && distanceKm ? parseFloat(distanceKm) / durationHours : 0;
  const caloriesBurned = distanceKm && avgSpeedKmh > 0
    ? estimateCalories(parseFloat(userWeightKg) || 70, durationSeconds, avgSpeedKmh)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!distanceKm || parseFloat(distanceKm) <= 0) {
      return;
    }

    onComplete({
      distanceKm: parseFloat(distanceKm),
      avgSpeedKmh,
      caloriesBurned,
    });
  };

  const isFormValid = distanceKm && parseFloat(distanceKm) > 0 && !disabled;

  return (
    <Card className="border-border bg-card p-6 w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Distance Input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="distance" className="text-sm font-medium text-foreground">
            Distance (km)
          </label>
          <Input
            id="distance"
            type="number"
            step="0.01"
            min="0.01"
            max="100"
            placeholder="e.g., 5.0"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            className="bg-background border-input text-foreground placeholder:text-muted-foreground"
            required
            autoFocus
            disabled={disabled}
          />
        </div>

        {/* Weight Input (Optional) */}
        <div className="flex flex-col gap-2">
          <label htmlFor="weight" className="text-sm font-medium text-foreground">
            Your Weight (kg) - Optional
          </label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            min="20"
            max="300"
            placeholder="70"
            value={userWeightKg}
            onChange={(e) => setUserWeightKg(e.target.value)}
            className="bg-background border-input text-foreground placeholder:text-muted-foreground"
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            Used for more accurate calorie calculation
          </p>
        </div>

        {/* Calculated Stats */}
        {distanceKm && avgSpeedKmh > 0 && (
          <div className="flex flex-col gap-3 rounded-lg bg-muted p-4">
            {/* Speed Display */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Avg Speed</span>
              </div>
              <span className="text-lg font-semibold text-foreground">
                {avgSpeedKmh.toFixed(1)} km/h
              </span>
            </div>

            {/* Calories Display */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium text-muted-foreground">Calories Burned</span>
              </div>
              <span className="text-lg font-semibold text-foreground">
                {Math.round(caloriesBurned)} kcal
              </span>
            </div>

            {/* Duration Display */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-muted-foreground">Duration</span>
              </div>
              <span className="text-lg font-semibold text-foreground">
                {Math.floor(durationSeconds / 60)}:{(durationSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={disabled}
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={!isFormValid}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {disabled ? 'Saving...' : 'Save Workout'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
