'use client';

import Link from 'next/link';
import { Target, Dumbbell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Exercise, MuscleGroup } from '@/types';

interface ExerciseCardProps {
  exercise: Exercise;
  showEquipmentBadge?: boolean;
  isUnavailable?: boolean;
}

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

const equipmentIcons = {
  bodyweight: Target,
  dumbbells: Dumbbell,
  barbells: Dumbbell,
  kettlebells: Dumbbell,
};

export function ExerciseCard({
  exercise,
  showEquipmentBadge = true,
  isUnavailable = false,
}: ExerciseCardProps) {
  const EquipmentIcon = equipmentIcons[exercise.equipment];

  return (
    <Link href={`/exercises/${exercise.id}`}>
      <Card
        className={cn(
          'group relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20',
          isUnavailable && 'opacity-50 grayscale'
        )}
      >
        <CardContent className="p-4">
          {/* Exercise Name */}
          <h3 className="font-semibold text-lg text-white group-hover:text-purple-300 transition-colors mb-2">
            {exercise.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
            {exercise.description}
          </p>

          {/* Tags Container */}
          <div className="flex flex-wrap gap-2">
            {/* Muscle Group Badges */}
            {exercise.muscleGroups.slice(0, 3).map((muscle) => (
              <Badge
                key={muscle}
                variant="outline"
                className={cn(
                  'text-xs',
                  muscleGroupColors[muscle as MuscleGroup]
                )}
              >
                {muscle}
              </Badge>
            ))}

            {/* Equipment Badge */}
            {showEquipmentBadge && (
              <Badge
                variant="outline"
                className="text-xs bg-gray-500/20 text-gray-300 border-gray-500/30"
              >
                <EquipmentIcon className="w-3 h-3 mr-1" />
                {equipmentLabels[exercise.equipment]}
              </Badge>
            )}

            {/* Difficulty Badge */}
            <Badge
              variant="outline"
              className={cn('text-xs', difficultyColors[exercise.difficulty])}
            >
              {exercise.difficulty}
            </Badge>
          </div>

          {/* Unavailable Overlay */}
          {isUnavailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="text-sm font-medium text-gray-300">
                Equipment Not Available
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
