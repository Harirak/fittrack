'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Target, Dumbbell, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Exercise, MuscleGroup } from '@/types';

const muscleGroupColors: Record<MuscleGroup, string> = {
  chest: 'bg-red-500/20 text-red-300 border-red-500/30',
  back: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  shoulders: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  biceps: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  triceps: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  core: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  quadriceps: 'bg-green-500/20 text-green-300 border-green-500/30',
  hamstrings: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  glutes: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  calves: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
};

const difficultyColors = {
  beginner: 'bg-green-500/20 text-green-300 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  advanced: 'bg-red-500/20 text-red-300 border-red-500/30',
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
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
          className="mb-4 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-12 text-center">
            <p className="text-gray-400 text-lg">{error || 'Exercise not found'}</p>
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
        className="mb-4 text-gray-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Exercises
      </Button>

      {/* Exercise Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">{exercise.name}</h1>
        <p className="text-gray-400 text-lg">{exercise.description}</p>
      </div>

      {/* Exercise Details Card */}
      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardContent className="p-6">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {/* Muscle Groups */}
            {exercise.muscleGroups.map((muscle) => (
              <Badge
                key={muscle}
                variant="outline"
                className="text-sm flex items-center gap-1"
              >
                <Target className="w-3 h-3" />
                {muscleGroupColors[muscle as MuscleGroup]
                  ? muscleGroupColors[muscle as MuscleGroup].split(' ')[0]
                  : ''}
                {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
              </Badge>
            ))}

            {/* Equipment */}
            <Badge
              variant="outline"
              className="text-sm flex items-center gap-1 bg-gray-500/20 text-gray-300 border-gray-500/30"
            >
              <Dumbbell className="w-3 h-3" />
              {equipmentLabels[exercise.equipment]}
            </Badge>

            {/* Difficulty */}
            <Badge
              variant="outline"
              className={`text-sm flex items-center gap-1 ${
                difficultyColors[exercise.difficulty].split(' ')[0]
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
            </Badge>
          </div>

          {/* Instructions */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Instructions</h2>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                {exercise.instructions}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Muscle Groups Section */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Target Muscles</h2>
          <div className="flex flex-wrap gap-2">
            {exercise.muscleGroups.map((muscle) => (
              <Badge
                key={muscle}
                variant="outline"
                className={`text-base py-2 px-4 ${
                  muscleGroupColors[muscle as MuscleGroup] || ''
                }`}
              >
                {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
