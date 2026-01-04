'use client';

import Link from 'next/link';
import { Target, Dumbbell, TrendingUp } from 'lucide-react';
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

const muscleGroupGradients: Record<MuscleGroup, string> = {
  chest: 'from-rose-500/40 to-orange-500/40',
  back: 'from-blue-500/40 to-cyan-500/40',
  shoulders: 'from-purple-500/40 to-fuchsia-500/40',
  biceps: 'from-pink-500/40 to-rose-500/40',
  triceps: 'from-orange-500/40 to-amber-500/40',
  core: 'from-yellow-500/40 to-amber-500/40',
  quadriceps: 'from-emerald-500/40 to-teal-500/40',
  hamstrings: 'from-indigo-500/40 to-purple-500/40',
  glutes: 'from-cyan-500/40 to-blue-500/40',
  calves: 'from-slate-500/40 to-gray-500/40',
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
  const primaryMuscle = exercise.muscleGroups[0];
  const gradient = muscleGroupGradients[primaryMuscle] || 'from-gray-500/40 to-slate-500/40';

  return (
    <Link href={`/exercises/${exercise.id}`}>
      <Card
        className={cn(
          'group relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg hover:border-brand-forest/50',
          isUnavailable && 'opacity-50 grayscale'
        )}
      >
        {/* Placeholder Image Header */}
        <div className={`h-40 w-full bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />

          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

          <EquipmentIcon className="w-16 h-16 text-foreground/20 z-10 drop-shadow-sm transition-transform group-hover:scale-110 duration-500" />
        </div>

        <CardContent className="p-4">
          {/* Exercise Name */}
          <h3 className="font-semibold text-lg text-foreground group-hover:text-brand-forest transition-colors mb-2">
            {exercise.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 h-10">
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
                  'text-xs flex items-center gap-1',
                  muscleGroupColors[muscle as MuscleGroup]
                )}
              >
                <Target className="w-3 h-3" />
                {muscle}
              </Badge>
            ))}

            {/* Equipment Badge */}
            {showEquipmentBadge && (
              <Badge
                variant="outline"
                className="text-xs bg-zinc-100 text-zinc-900 border-zinc-300 font-medium"
              >
                <EquipmentIcon className="w-3 h-3 mr-1" />
                {equipmentLabels[exercise.equipment]}
              </Badge>
            )}

            {/* Difficulty Badge */}
            <Badge
              variant="outline"
              className={cn('text-xs flex items-center gap-1', difficultyColors[exercise.difficulty])}
            >
              <TrendingUp className="w-3 h-3" />
              {exercise.difficulty}
            </Badge>
          </div>

          {/* Unavailable Overlay */}
          {isUnavailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
              <span className="text-sm font-medium text-muted-foreground bg-background/80 px-3 py-1 rounded-full border border-border">
                Equipment Not Available
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
