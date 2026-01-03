'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { estimateCalories } from '@/lib/calories';
import { Flame, Gauge } from 'lucide-react';

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
    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Distance Input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="distance" className="text-sm font-medium text-white/90">
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
            className="bg-gray-800 border-gray-700 text-white placeholder:text-white/40"
            required
            autoFocus
            disabled={disabled}
          />
        </div>

        {/* Weight Input (Optional) */}
        <div className="flex flex-col gap-2">
          <label htmlFor="weight" className="text-sm font-medium text-white/90">
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
            className="bg-gray-800 border-gray-700 text-white placeholder:text-white/40"
            disabled={disabled}
          />
          <p className="text-xs text-white/50">
            Used for more accurate calorie calculation
          </p>
        </div>

        {/* Calculated Stats */}
        {distanceKm && avgSpeedKmh > 0 && (
          <div className="flex flex-col gap-3 rounded-lg bg-gray-800/50 p-4">
            {/* Speed Display */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-purple-400" />
                <span className="text-sm font-medium text-white/80">Avg Speed</span>
              </div>
              <span className="text-lg font-semibold text-white">
                {avgSpeedKmh.toFixed(1)} km/h
              </span>
            </div>

            {/* Calories Display */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-400" />
                <span className="text-sm font-medium text-white/80">Calories Burned</span>
              </div>
              <span className="text-lg font-semibold text-white">
                {Math.round(caloriesBurned)} kcal
              </span>
            </div>

            {/* Duration Display */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white/80">Duration</span>
              </div>
              <span className="text-lg font-semibold text-white">
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
            className="flex-1 border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
            disabled={disabled}
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={!isFormValid}
            className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700 disabled:opacity-50"
          >
            {disabled ? 'Saving...' : 'Save Workout'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
