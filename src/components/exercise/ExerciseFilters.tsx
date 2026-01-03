'use client';

import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { MuscleGroup, ExerciseEquipment, Difficulty } from '@/types';

interface ExerciseFiltersProps {
  selectedMuscles: MuscleGroup[];
  selectedEquipment: ExerciseEquipment[];
  selectedDifficulty: Difficulty[];
  onMuscleChange: (muscle: MuscleGroup, checked: boolean) => void;
  onEquipmentChange: (equipment: ExerciseEquipment, checked: boolean) => void;
  onDifficultyChange: (difficulty: Difficulty, checked: boolean) => void;
  availableEquipment?: ExerciseEquipment[];
}

const muscleGroups: MuscleGroup[] = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'core',
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
];

const equipmentTypes: ExerciseEquipment[] = [
  'bodyweight',
  'dumbbells',
  'barbells',
  'kettlebells',
];

const difficultyLevels: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

export function ExerciseFilters({
  selectedMuscles,
  selectedEquipment,
  selectedDifficulty,
  onMuscleChange,
  onEquipmentChange,
  onDifficultyChange,
  availableEquipment,
}: ExerciseFiltersProps) {
  const totalFilters =
    selectedMuscles.length +
    selectedEquipment.length +
    selectedDifficulty.length;

  return (
    <div className="flex items-center gap-2">
      {/* Muscle Group Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Muscle Groups
            {selectedMuscles.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedMuscles.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Filter by Muscle Group</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {muscleGroups.map((muscle) => (
            <DropdownMenuCheckboxItem
              key={muscle}
              checked={selectedMuscles.includes(muscle)}
              onCheckedChange={(checked) => onMuscleChange(muscle, checked)}
            >
              {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Equipment Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Equipment
            {selectedEquipment.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedEquipment.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Filter by Equipment</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {equipmentTypes.map((equipment) => {
            const isAvailable =
              !availableEquipment || availableEquipment.includes(equipment);

            return (
              <DropdownMenuCheckboxItem
                key={equipment}
                checked={selectedEquipment.includes(equipment)}
                onCheckedChange={(checked) =>
                  isAvailable && onEquipmentChange(equipment, checked)
                }
                disabled={!isAvailable}
              >
                {equipment.charAt(0).toUpperCase() + equipment.slice(1)}
                {!isAvailable && (
                  <span className="ml-2 text-xs text-gray-500">
                    (Not Available)
                  </span>
                )}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Difficulty Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Difficulty
            {selectedDifficulty.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedDifficulty.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Filter by Difficulty</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {difficultyLevels.map((difficulty) => (
            <DropdownMenuCheckboxItem
              key={difficulty}
              checked={selectedDifficulty.includes(difficulty)}
              onCheckedChange={(checked) => onDifficultyChange(difficulty, checked)}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters */}
      {totalFilters > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            selectedMuscles.forEach((m) => onMuscleChange(m, false));
            selectedEquipment.forEach((e) => onEquipmentChange(e, false));
            selectedDifficulty.forEach((d) => onDifficultyChange(d, false));
          }}
        >
          Clear ({totalFilters})
        </Button>
      )}
    </div>
  );
}
