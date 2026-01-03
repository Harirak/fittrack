'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { EquipmentToggle } from '@/components/ui/EquipmentToggle';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EQUIPMENT_LABELS, GOAL_LABELS, FITNESS_LEVEL_LABELS, UNIT_LABELS } from '@/lib/constants';
import type { EquipmentProfile } from '@/lib/db/schema';

type Step = 'welcome' | 'fitness' | 'equipment' | 'goals' | 'complete';

interface OnboardingData {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  unitPreference: 'metric' | 'imperial';
  equipment: EquipmentProfile;
  goal: 'build_muscle' | 'lose_weight' | 'general_fitness';
}

const TOTAL_STEPS = 4;
const STEP_TITLES: Record<Step, string> = {
  welcome: 'Welcome to FitTrack Pro',
  fitness: 'Tell us about yourself',
  equipment: 'What equipment do you have?',
  goals: 'What are your fitness goals?',
  complete: "You're all set!",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    fitnessLevel: 'beginner',
    unitPreference: 'metric',
    equipment: {
      id: '',
      userId: '',
      dumbbells: false,
      barbells: false,
      kettlebells: false,
      bodyweight: true,
      updatedAt: new Date(),
    },
    goal: 'general_fitness',
  });

  const stepNumber = currentStep === 'welcome' ? 0 : currentStep === 'complete' ? TOTAL_STEPS : ['fitness', 'equipment', 'goals'].indexOf(currentStep) + 1;
  const progress = (stepNumber / TOTAL_STEPS) * 100;

  const handleNext = async () => {
    if (currentStep === 'welcome') {
      setCurrentStep('fitness');
    } else if (currentStep === 'fitness') {
      setCurrentStep('equipment');
    } else if (currentStep === 'equipment') {
      setCurrentStep('goals');
    } else if (currentStep === 'goals') {
      await saveOnboardingData();
    }
  };

  const handleBack = () => {
    if (currentStep === 'fitness') {
      setCurrentStep('welcome');
    } else if (currentStep === 'equipment') {
      setCurrentStep('fitness');
    } else if (currentStep === 'goals') {
      setCurrentStep('equipment');
    }
  };

  const saveOnboardingData = async () => {
    setIsLoading(true);
    try {
      // Save user profile data
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fitnessLevel: data.fitnessLevel,
          unitPreference: data.unitPreference,
        }),
      });

      // Save equipment profile
      await fetch('/api/user/equipment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dumbbells: data.equipment.dumbbells,
          barbells: data.equipment.barbells,
          kettlebells: data.equipment.kettlebells,
          bodyweight: data.equipment.bodyweight,
        }),
      });

      // Save activity goals
      await fetch('/api/user/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          daily: {
            durationMinutes: 30,
            distanceKm: 3,
            workoutCount: 1,
          },
          weekly: {
            durationMinutes: 150,
            distanceKm: 20,
            workoutCount: 4,
          },
        }),
      });

      // Mark onboarding as complete (stored in user profile)
      await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      setCurrentStep('complete');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    router.push('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
      {/* Header with progress */}
      <div className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
        <div className="mx-auto max-w-lg px-4 py-6">
          <div className="mb-2 flex items-center justify-between text-sm text-zinc-400">
            <span>Step {stepNumber} of {TOTAL_STEPS}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <h1 className="mt-4 text-center text-xl font-semibold text-white">
            {STEP_TITLES[currentStep]}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="mx-auto max-w-lg px-4 py-8">
          {currentStep === 'welcome' && (
            <WelcomeStep onNext={handleNext} />
          )}

          {currentStep === 'fitness' && (
            <FitnessStep
              data={data}
              onChange={setData}
              onNext={handleNext}
              onBack={handleBack}
              isLoading={isLoading}
            />
          )}

          {currentStep === 'equipment' && (
            <EquipmentStep
              data={data}
              onChange={setData}
              onNext={handleNext}
              onBack={handleBack}
              isLoading={isLoading}
            />
          )}

          {currentStep === 'goals' && (
            <GoalsStep
              data={data}
              onChange={setData}
              onNext={handleNext}
              onBack={handleBack}
              isLoading={isLoading}
            />
          )}

          {currentStep === 'complete' && (
            <CompleteStep onFinish={handleFinish} />
          )}
        </div>
      </div>
    </div>
  );
}

// ============ Step Components ============

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
          <Check className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          Let's set up your profile
        </h2>
        <p className="mt-2 text-zinc-400">
          We'll personalize your experience based on your fitness level, equipment, and goals.
        </p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-400">
              1
            </div>
            <div>
              <h3 className="font-medium text-white">Fitness Level</h3>
              <p className="text-sm text-zinc-400">Tell us about your experience</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-500/20 text-xs font-bold text-pink-400">
              2
            </div>
            <div>
              <h3 className="font-medium text-white">Your Equipment</h3>
              <p className="text-sm text-zinc-400">Select what you have available</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">
              3
            </div>
            <div>
              <h3 className="font-medium text-white">Your Goals</h3>
              <p className="text-sm text-zinc-400">Set your fitness targets</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          Get Started
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function FitnessStep({
  data,
  onChange,
  onNext,
  onBack,
  isLoading,
}: {
  data: OnboardingData;
  onChange: (data: OnboardingData) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-6">
      <p className="text-center text-zinc-400">
        This helps us recommend exercises and workouts that match your experience level.
      </p>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="space-y-6 p-6">
          <div>
            <label className="mb-3 block text-sm font-medium text-white">
              Fitness Level
            </label>
            <div className="grid gap-3">
              {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => onChange({ ...data, fitnessLevel: level })}
                  className={cn(
                    'flex items-center justify-between rounded-lg border-2 p-4 text-left transition-all',
                    data.fitnessLevel === level
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  )}
                >
                  <span className="font-medium text-white">
                    {FITNESS_LEVEL_LABELS[level]}
                  </span>
                  {data.fitnessLevel === level && (
                    <Check className="h-5 w-5 text-purple-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-white">
              Preferred Units
            </label>
            <div className="grid gap-3">
              {(['metric', 'imperial'] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => onChange({ ...data, unitPreference: unit })}
                  className={cn(
                    'flex items-center justify-between rounded-lg border-2 p-4 text-left transition-all',
                    data.unitPreference === unit
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  )}
                >
                  <span className="font-medium text-white">
                    {UNIT_LABELS[unit]}
                  </span>
                  {data.unitPreference === unit && (
                    <Check className="h-5 w-5 text-purple-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={isLoading}
          className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function EquipmentStep({
  data,
  onChange,
  onNext,
  onBack,
  isLoading,
}: {
  data: OnboardingData;
  onChange: (data: OnboardingData) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const handleEquipmentChange = (key: keyof EquipmentProfile, value: boolean) => {
    onChange({
      ...data,
      equipment: { ...data.equipment, [key]: value },
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-center text-zinc-400">
        Select all the equipment you have access to. We'll filter exercises and workouts to match what's available.
      </p>

      <EquipmentToggle
        profile={data.equipment}
        onChange={handleEquipmentChange}
        disabled={isLoading}
      />

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={isLoading}
          className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function GoalsStep({
  data,
  onChange,
  onNext,
  onBack,
  isLoading,
}: {
  data: OnboardingData;
  onChange: (data: OnboardingData) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-6">
      <p className="text-center text-zinc-400">
        Knowing your goals helps us generate personalized workout plans for you.
      </p>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="space-y-4 p-6">
          {(['build_muscle', 'lose_weight', 'general_fitness'] as const).map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => onChange({ ...data, goal })}
              className={cn(
                'w-full rounded-lg border-2 p-6 text-left transition-all',
                data.goal === goal
                  ? 'border-purple-500 bg-gradient-to-br from-purple-500/10 to-pink-500/10'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {GOAL_LABELS[goal]}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    {goal === 'build_muscle' && 'Focus on strength and hypertrophy training'}
                    {goal === 'lose_weight' && 'High-intensity workouts to burn calories'}
                    {goal === 'general_fitness' && 'Balanced training for overall health'}
                  </p>
                </div>
                {data.goal === goal && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={isLoading}
          className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {isLoading ? 'Saving...' : 'Complete Setup'}
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

function CompleteStep({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500">
        <Check className="h-12 w-12 text-white" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white">
          You're all set!
        </h2>
        <p className="mt-2 text-zinc-400">
          Your profile has been configured. Start tracking your workouts today!
        </p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="space-y-4 p-6">
          <h3 className="font-medium text-white">What's next?</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3 text-sm">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-400">
                1
              </div>
              <div>
                <p className="font-medium text-white">Browse exercises</p>
                <p className="text-zinc-400">Explore our library based on your equipment</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-500/20 text-xs font-bold text-pink-400">
                2
              </div>
              <div>
                <p className="font-medium text-white">Log a workout</p>
                <p className="text-zinc-400">Track your treadmill or strength sessions</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">
                3
              </div>
              <div>
                <p className="font-medium text-white">Generate AI plans</p>
                <p className="text-zinc-400">Get personalized workout recommendations</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={onFinish}
        className="w-full gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
      >
        Go to Dashboard
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
