'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ManualWorkoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: '0',
    minutes: '30',
    distanceKm: '',
    weightKg: '70',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const hours = parseInt(formData.hours) || 0;
      const minutes = parseInt(formData.minutes) || 0;
      const durationSeconds = hours * 3600 + minutes * 60;

      // Calculate speed
      const distanceKm = parseFloat(formData.distanceKm);
      const durationHours = durationSeconds / 3600;
      const avgSpeedKmh = durationHours > 0 ? distanceKm / durationHours : 0;

      // Calculate calories
      const weightKg = parseFloat(formData.weightKg) || 70;
      const caloriesBurned = avgSpeedKmh > 0
        ? Math.round((avgSpeedKmh * weightKg * durationSeconds) / 3600 * 1.05) // Simplified MET formula
        : 0;

      const response = await fetch('/api/workouts/treadmill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startedAt: new Date(formData.date).toISOString(),
          durationSeconds,
          distanceKm,
          avgSpeedKmh,
          caloriesBurned,
        }),
      });

      if (response.ok) {
        router.push('/workouts');
      } else {
        console.error('Failed to save workout');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      setLoading(false);
    }
  };

  const isFormValid = formData.distanceKm && parseFloat(formData.distanceKm) > 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-4 p-4 md:p-6">
          <Link href="/workouts">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-foreground">Manual Entry</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-md">
          <Card className="border-border bg-card p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Date Input */}
              <div className="flex flex-col gap-2">
                <label htmlFor="date" className="text-sm font-medium text-foreground">
                  <Calendar className="mr-2 inline h-4 w-4" />
                  Date
                </label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="bg-background border-input text-foreground"
                  required
                />
              </div>

              {/* Duration Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">
                  <Clock className="mr-2 inline h-4 w-4" />
                  Duration
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="0"
                      max="23"
                      placeholder="0"
                      value={formData.hours}
                      onChange={(e) => handleChange('hours', e.target.value)}
                      className="bg-background border-input text-foreground"
                    />
                    <span className="mt-1 block text-xs text-muted-foreground">Hours</span>
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="30"
                      value={formData.minutes}
                      onChange={(e) => handleChange('minutes', e.target.value)}
                      className="bg-background border-input text-foreground"
                    />
                    <span className="mt-1 block text-xs text-muted-foreground">Minutes</span>
                  </div>
                </div>
              </div>

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
                  value={formData.distanceKm}
                  onChange={(e) => handleChange('distanceKm', e.target.value)}
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              {/* Weight Input */}
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
                  value={formData.weightKg}
                  onChange={(e) => handleChange('weightKg', e.target.value)}
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Used for more accurate calorie calculation
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid || loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Workout'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
