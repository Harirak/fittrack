'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GenerateForm } from '@/components/plan/GenerateForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle2, Clock, Dumbbell, ArrowRight, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PlanExercise } from '@/lib/db/schema';

interface GeneratedPlan {
  name: string;
  description: string;
  exercises: PlanExercise[];
}

export default function GeneratePlanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userEquipment, setUserEquipment] = useState<string[]>(['bodyweight']);
  const [userFitnessLevel, setUserFitnessLevel] = useState<string>('beginner');

  const handleGenerate = async (params: {
    goal: string;
    durationMinutes: number;
    equipment: string[];
    fitnessLevel: string;
  }) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate workout plan');
      }

      setGeneratedPlan(data.plan);
      toast({
        title: 'Workout plan generated!',
        description: `Created a ${params.durationMinutes}-minute ${params.goal.replace('_', ' ')} workout.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate workout plan';
      setError(errorMessage);
      toast({
        title: 'Generation failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePlan = async () => {
    if (!generatedPlan) return;

    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: generatedPlan.name,
          goal: 'general_fitness',
          durationMinutes: generatedPlan.exercises.length * 5, // Estimate
          exercises: generatedPlan.exercises,
          isAiGenerated: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save plan');
      }

      const data = await response.json();
      toast({
        title: 'Plan saved!',
        description: 'Your workout plan has been added to your library.',
      });

      // Navigate to the new plan
      router.push(`/plans/${data.plan.id}`);
    } catch (err) {
      toast({
        title: 'Failed to save',
        description: 'Could not save your workout plan. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRegenerate = () => {
    setGeneratedPlan(null);
    setError(null);
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          Generate Workout
        </h1>
        <p className="text-muted-foreground mt-1">
          Create a personalized workout plan powered by AI
        </p>
      </div>

      {!generatedPlan ? (
        <>
          <GenerateForm
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            userEquipment={userEquipment}
            userFitnessLevel={userFitnessLevel}
          />

          {/* Error State */}
          {error && (
            <Card className="mt-6 border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  Generation Failed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{error}</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleRegenerate} className="flex-1">
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/exercises')}
                    className="flex-1"
                  >
                    Browse Exercises
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <div className="space-y-6">
          {/* Success Message */}
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-semibold text-green-500">Workout Generated!</p>
                  <p className="text-sm text-muted-foreground">
                    Review your plan below and save it to your library
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Plan */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-500" />
                    {generatedPlan.name}
                  </CardTitle>
                  {generatedPlan.description && (
                    <CardDescription className="mt-2">
                      {generatedPlan.description}
                    </CardDescription>
                  )}
                </div>
                <Badge variant="secondary" className="shrink-0">
                  AI Generated
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Dumbbell className="h-4 w-4" />
                  <span>{generatedPlan.exercises.length} exercises</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>~{generatedPlan.exercises.length * 5} min</span>
                </div>
              </div>

              <Separator />

              {/* Exercise List */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Exercises</p>
                {generatedPlan.exercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{exercise.exerciseName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {exercise.sets} sets × {exercise.reps} reps
                        {exercise.restSeconds && ` · ${exercise.restSeconds}s rest`}
                      </p>
                      {exercise.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {exercise.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="flex-1"
            >
              Regenerate
            </Button>
            <Button
              onClick={handleSavePlan}
              disabled={isGenerating}
              className="flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
            >
              Save to Library
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
