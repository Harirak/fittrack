'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { ExerciseFilters } from '@/components/exercise/ExerciseFilters';
import { useUser } from '@clerk/nextjs';
import type { Exercise, MuscleGroup, ExerciseEquipment, Difficulty } from '@/types';

export default function ExercisesPage() {
  const { user } = useUser();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState<MuscleGroup[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<ExerciseEquipment[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty[]>([]);
  const [availableEquipment, setAvailableEquipment] = useState<ExerciseEquipment[]>([
    'bodyweight',
    'dumbbells',
    'barbells',
    'kettlebells',
  ]);

  // Fetch user's equipment profile
  useEffect(() => {
    async function fetchEquipment() {
      try {
        const response = await fetch('/api/user/equipment');
        if (response.ok) {
          const data = await response.json();
          const equipment: ExerciseEquipment[] = [];
          if (data.equipment.bodyweight) equipment.push('bodyweight');
          if (data.equipment.dumbbells) equipment.push('dumbbells');
          if (data.equipment.barbells) equipment.push('barbells');
          if (data.equipment.kettlebells) equipment.push('kettlebells');
          setAvailableEquipment(equipment);
        }
      } catch (error) {
        console.error('Error fetching equipment:', error);
      }
    }

    if (user) {
      fetchEquipment();
    }
  }, [user]);

  // Fetch exercises
  useEffect(() => {
    async function fetchExercises() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedMuscles.length > 0) {
          params.set('muscleGroups', selectedMuscles.join(','));
        }
        if (selectedEquipment.length > 0) {
          params.set('equipment', selectedEquipment.join(','));
        }
        if (selectedDifficulty.length > 0) {
          params.set('difficulty', selectedDifficulty.join(','));
        }

        const queryString = params.toString();
        const response = await fetch(`/api/exercises${queryString ? `?${queryString}` : ''}`);

        if (response.ok) {
          const data = await response.json();
          setExercises(data.exercises);
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchExercises();
  }, [selectedMuscles, selectedEquipment, selectedDifficulty]);

  // Filter by search query
  const filteredExercises = exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter out unavailable exercises
  const availableExercises = filteredExercises.filter((exercise) =>
    availableEquipment.includes(exercise.equipment)
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Exercise Library</h1>
        <p className="text-gray-400">
          Browse and filter exercises based on your available equipment
        </p>
      </div>

      {/* Search and Filters */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-sm z-10 pb-4 mb-6 border-b border-gray-800">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Filters */}
          <ExerciseFilters
            selectedMuscles={selectedMuscles}
            selectedEquipment={selectedEquipment}
            selectedDifficulty={selectedDifficulty}
            onMuscleChange={(muscle, checked) => {
              if (checked) {
                setSelectedMuscles([...selectedMuscles, muscle]);
              } else {
                setSelectedMuscles(selectedMuscles.filter((m) => m !== muscle));
              }
            }}
            onEquipmentChange={(equipment, checked) => {
              if (checked) {
                setSelectedEquipment([...selectedEquipment, equipment]);
              } else {
                setSelectedEquipment(selectedEquipment.filter((e) => e !== equipment));
              }
            }}
            onDifficultyChange={(difficulty, checked) => {
              if (checked) {
                setSelectedDifficulty([...selectedDifficulty, difficulty]);
              } else {
                setSelectedDifficulty(selectedDifficulty.filter((d) => d !== difficulty));
              }
            }}
            availableEquipment={availableEquipment}
          />
        </div>
      </div>

      {/* Exercises Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-400">Loading exercises...</p>
        </div>
      ) : availableExercises.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-2">No exercises found</p>
          <p className="text-gray-500 text-sm">
            Try adjusting your filters or search query
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              isUnavailable={!availableEquipment.includes(exercise.equipment)}
            />
          ))}
        </div>
      )}

      {/* Results Count */}
      {!loading && availableExercises.length > 0 && (
        <div className="mt-6 text-center text-gray-400 text-sm">
          Showing {availableExercises.length} exercise{availableExercises.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
