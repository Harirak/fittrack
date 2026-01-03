// Calorie estimation utilities for treadmill workouts
// Uses MET (Metabolic Equivalent of Task) formula

// MET values for different activities/speeds
// Source: Compendium of Physical Activities
const SPEED_MET_MAP: Record<number, number> = {
  // Walking speeds (km/h)
  3: 3.5,   // Slow walking
  4: 4.0,   // Moderate walking
  5: 4.5,   // Brisk walking
  6: 6.0,   // Very brisk walking

  // Jogging speeds (km/h)
  7: 8.0,   // Slow jog
  8: 9.0,   // Jogging

  // Running speeds (km/h)
  9: 10.0,  // Slow run
  10: 11.0, // Running
  11: 12.0, // Fast running
  12: 13.0, // Fast running
  13: 14.0, // Very fast running
  14: 15.0, // Sprint
  15: 16.0, // Sprint
};

/**
 * Estimate calories burned for a treadmill workout
 *
 * Formula: Calories = MET × weight(kg) × duration(hours)
 *
 * @param weightKg - User weight in kilograms
 * @param durationSeconds - Workout duration in seconds
 * @param speedKmh - Average speed in km/h
 * @returns Estimated calories burned
 */
export function estimateCalories(
  weightKg: number,
  durationSeconds: number,
  speedKmh: number
): number {
  // Validate inputs
  if (weightKg <= 0 || durationSeconds <= 0 || speedKmh <= 0) {
    return 0;
  }

  // Find appropriate MET value based on speed
  const speedRounded = Math.round(speedKmh);
  let met = SPEED_MET_MAP[speedRounded];

  // Interpolate between known values if exact match not found
  if (!met) {
    const speeds = Object.keys(SPEED_MET_MAP).map(Number).sort((a, b) => a - b);

    // Below minimum
    if (speedKmh < speeds[0]) {
      met = SPEED_MET_MAP[speeds[0]];
    }
    // Above maximum
    else if (speedKmh > speeds[speeds.length - 1]) {
      met = SPEED_MET_MAP[speeds[speeds.length - 1]];
    }
    // Interpolate between two closest values
    else {
      const lowerSpeed = speeds.filter((s) => s < speedKmh).pop() || speeds[0];
      const upperSpeed = speeds.find((s) => s > speedKmh) || speeds[speeds.length - 1];
      const lowerMet = SPEED_MET_MAP[lowerSpeed];
      const upperMet = SPEED_MET_MAP[upperSpeed];

      // Linear interpolation
      const ratio = (speedKmh - lowerSpeed) / (upperSpeed - lowerSpeed);
      met = lowerMet + ratio * (upperMet - lowerMet);
    }
  }

  // Convert duration from seconds to hours
  const durationHours = durationSeconds / 3600;

  // Calculate calories
  const calories = met * weightKg * durationHours;

  return Math.round(calories);
}

/**
 * Estimate calories burned for a workout without specific weight
 * Uses average adult weight of 70kg
 */
export function estimateCaloriesDefaultWeight(
  durationSeconds: number,
  speedKmh: number
): number {
  return estimateCalories(70, durationSeconds, speedKmh);
}

/**
 * Calculate average speed from distance and duration
 */
export function calculateSpeed(distanceKm: number, durationSeconds: number): number {
  if (durationSeconds <= 0) return 0;
  const durationHours = durationSeconds / 3600;
  return distanceKm / durationHours;
}

/**
 * Format calories for display
 */
export function formatCalories(calories: number): string {
  return Math.round(calories).toLocaleString();
}

/**
 * Get MET value for a given speed (for debugging/info)
 */
export function getMetForSpeed(speedKmh: number): number {
  const speedRounded = Math.round(speedKmh);
  return SPEED_MET_MAP[speedRounded] || estimateCaloriesDefaultWeight(3600, speedKmh);
}
