'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Dumbbell, Target, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type GenerateFormProps = {
  onGenerate: (params: {
    goal: string;
    durationMinutes: number;
    equipment: string[];
    fitnessLevel: string;
  }) => void;
  isGenerating?: boolean;
  userEquipment?: string[];
  userFitnessLevel?: string;
};

const GOALS = [
  { value: 'build_muscle', label: 'Build Muscle', icon: Dumbbell, description: 'Strength-focused workouts' },
  { value: 'lose_weight', label: 'Lose Weight', icon: Target, description: 'High-intensity calorie burn' },
  { value: 'general_fitness', label: 'General Fitness', icon: Target, description: 'Balanced health & wellness' },
];

const DURATIONS = [
  { value: 15, label: '15 min', description: 'Quick session' },
  { value: 30, label: '30 min', description: 'Standard workout' },
  { value: 45, label: '45 min', description: 'Extended session' },
  { value: 60, label: '60 min', description: 'Full workout' },
];

const FITNESS_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'New to working out' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
  { value: 'advanced', label: 'Advanced', description: 'Experienced athlete' },
];

const EQUIPMENT_OPTIONS = [
  { value: 'bodyweight', label: 'Bodyweight', icon: '🏃' },
  { value: 'dumbbells', label: 'Dumbbells', icon: '🏋️' },
  { value: 'kettlebells', label: 'Kettlebells', icon: '🔔' },
  { value: 'barbells', label: 'Barbells', icon: '🏋️‍♂️' },
];

export function GenerateForm({
  onGenerate,
  isGenerating = false,
  userEquipment = ['bodyweight'],
  userFitnessLevel = 'beginner',
}: GenerateFormProps) {
  const [goal, setGoal] = useState<string>('general_fitness');
  const [duration, setDuration] = useState<number>(30);
  const [equipment, setEquipment] = useState<string[]>(userEquipment);
  const [fitnessLevel, setFitnessLevel] = useState<string>(userFitnessLevel);

  const toggleEquipment = (eq: string) => {
    setEquipment((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]
    );
  };

  const handleGenerate = () => {
    if (equipment.length === 0) {
      return; // Don't generate without equipment
    }
    onGenerate({
      goal,
      durationMinutes: duration,
      equipment,
      fitnessLevel,
    });
  };

  const canGenerate = equipment.length > 0 && !isGenerating;

  return (
    <div className="space-y-6">
      {/* Goal Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What's your goal?</CardTitle>
          <CardDescription>Choose your primary fitness objective</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={goal} onValueChange={setGoal} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {GOALS.map((g) => {
                const Icon = g.icon;
                return (
                  <TabsTrigger key={g.value} value={g.value} className="flex-col gap-1 py-3">
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{g.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
          <p className="mt-3 text-sm text-muted-foreground">
            {GOALS.find((g) => g.value === goal)?.description}
          </p>
        </CardContent>
      </Card>

      {/* Duration Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            How long?
          </CardTitle>
          <CardDescription>Choose your workout duration</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={String(duration)} onValueChange={(v) => setDuration(Number(v))} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {DURATIONS.map((d) => (
                <TabsTrigger key={d.value} value={String(d.value)} className="flex-col gap-1 py-3">
                  <span className="text-sm font-semibold">{d.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <p className="mt-3 text-sm text-muted-foreground">
            {DURATIONS.find((d) => d.value === duration)?.description}
          </p>
        </CardContent>
      </Card>

      {/* Equipment Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Available Equipment
          </CardTitle>
          <CardDescription>Select what you have access to</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {EQUIPMENT_OPTIONS.map((eq) => {
              const isSelected = equipment.includes(eq.value);
              const isAvailable = userEquipment.includes(eq.value);
              return (
                <button
                  key={eq.value}
                  onClick={() => isAvailable && toggleEquipment(eq.value)}
                  disabled={!isAvailable}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : isAvailable
                      ? 'border-border hover:border-primary/50'
                      : 'border-border opacity-40 cursor-not-allowed'
                  )}
                >
                  <span className="text-2xl">{eq.icon}</span>
                  <span className="text-sm font-medium">{eq.label}</span>
                  {!isAvailable && (
                    <Badge variant="outline" className="text-xs">
                      Not available
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
          {equipment.length === 0 && (
            <p className="mt-3 text-sm text-destructive">
              Please select at least one equipment type
            </p>
          )}
        </CardContent>
      </Card>

      {/* Fitness Level */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fitness Level</CardTitle>
          <CardDescription>Help us tailor the workout intensity</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={fitnessLevel} onValueChange={setFitnessLevel} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {FITNESS_LEVELS.map((level) => (
                <TabsTrigger key={level.value} value={level.value} className="flex-col gap-1 py-3">
                  <span className="text-xs">{level.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <p className="mt-3 text-sm text-muted-foreground">
            {FITNESS_LEVELS.find((l) => l.value === fitnessLevel)?.description}
          </p>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className="w-full h-14 text-lg"
        size="lg"
      >
        <Sparkles className="mr-2 h-5 w-5" />
        {isGenerating ? 'Generating...' : 'Generate Workout Plan'}
      </Button>
    </div>
  );
}
