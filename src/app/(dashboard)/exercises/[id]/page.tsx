'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Target, Dumbbell, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Exercise, MuscleGroup } from '@/types';

const muscleGroupColors: Record<MuscleGroup, string> = {
  chest: 'bg-red-100 text-red-700 border-red-300',
  back: 'bg-blue-100 text-blue-700 border-blue-300',
  shoulders: 'bg-purple-100 text-purple-700 border-purple-300',
  biceps: 'bg-pink-100 text-pink-700 border-pink-300',
  triceps: 'bg-orange-100 text-orange-700 border-orange-300',
  core: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  quadriceps: 'bg-green-100 text-green-700 border-green-300',
  hamstrings: 'bg-teal-100 text-teal-700 border-teal-300',
  glutes: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  calves: 'bg-indigo-100 text-indigo-700 border-indigo-300',
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700 border-green-300',
  intermediate: 'bg-amber-100 text-amber-700 border-amber-300',
  advanced: 'bg-red-100 text-red-700 border-red-300',
};

const equipmentLabels = {
  bodyweight: 'Bodyweight',
  dumbbells: 'Dumbbells',
  barbells: 'Barbells',
  kettlebells: 'Kettlebells',
};

export default function ExerciseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExercise() {
      try {
        const response = await fetch(`/api/exercises/${params.id}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Exercise not found');
          } else {
            setError('Failed to load exercise');
          }
          return;
        }

        const data = await response.json();
        setExercise(data.exercise);
      } catch (err) {
        console.error('Error fetching exercise:', err);
        setError('Failed to load exercise');
      } finally {
        setLoading(false);
      }
    }

    fetchExercise();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground text-lg">{error || 'Exercise not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Exercises
      </Button>

      {/* Exercise Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">{exercise.name}</h1>
        <p className="text-muted-foreground text-lg">{exercise.description}</p>
      </div>

      {/* Exercise Details Card */}
      <Card className="bg-card border-border mb-6">
        <CardContent className="p-6">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {/* Muscle Groups */}
            {exercise.muscleGroups.map((muscle) => (
              <Badge
                key={muscle}
                variant="outline"
                className={cn(
                  "text-sm flex items-center gap-1",
                  muscleGroupColors[muscle as MuscleGroup]
                )}
              >
                <Target className="w-3 h-3" />
                {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
              </Badge>
            ))}

            {/* Equipment */}
            <Badge
              variant="outline"
              className="text-sm flex items-center gap-1 bg-zinc-100 text-zinc-900 border-zinc-300 font-medium"
            >
              <Dumbbell className="w-3 h-3" />
              {equipmentLabels[exercise.equipment]}
            </Badge>

            {/* Difficulty */}
            <Badge
              variant="outline"
              className={cn(
                "text-sm flex items-center gap-1",
                difficultyColors[exercise.difficulty]
              )}
            >
              <TrendingUp className="w-3 h-3" />
              {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
            </Badge>
          </div>

          {/* Instructions */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Instructions</h2>
            <div className="bg-muted rounded-lg p-4">
              <div className="text-foreground whitespace-pre-line leading-relaxed">
                {exercise.instructions}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Muscle Groups Section */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Target Muscles</h2>
          <div className="flex flex-wrap gap-2">
            {exercise.muscleGroups.map((muscle) => (
              <Badge
                key={muscle}
                variant="outline"
                className={cn(
                  'text-base py-2 px-4 flex items-center gap-2',
                  muscleGroupColors[muscle as MuscleGroup]
                )}
              >
                <Target className="w-4 h-4" />
                {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
