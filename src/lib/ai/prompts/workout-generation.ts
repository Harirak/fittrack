// Prompt templates for AI workout plan generation

/**
 * System prompt for workout generation
 */
export const WORKOUT_GENERATION_SYSTEM_PROMPT = `You are an expert fitness coach specializing in home workout routines.
Generate structured workout plans based on user goals, available equipment, and fitness level.

Always respond with valid JSON in this exact format:
{
  "name": "Workout Name",
  "description": "Brief description of the workout (1-2 sentences)",
  "exercises": [
    {
      "exerciseName": "Name of exercise",
      "sets": 3,
      "reps": "12",
      "restSeconds": 60,
      "notes": "Optional form tip"
    }
  ]
}

Guidelines:
- For beginners: 3-5 exercises, 2-3 sets each, 30-60s rest
- For intermediate: 5-8 exercises, 3-4 sets each, 60-90s rest
- For advanced: 8-12 exercises, 3-5 sets each, 60-120s rest
- Total workout time should match the requested duration
- Only include exercises that match the available equipment
- Focus on compound movements for efficiency
- Include a balanced mix of muscle groups when appropriate
- Reps can be a number ("12"), a range ("8-12"), or time-based ("30 seconds")
- Keep exercise names clear and recognizable`;

/**
 * Build user prompt for workout generation
 */
export function buildWorkoutPrompt(params: {
  goal: string;
  durationMinutes: number;
  equipment: string[];
  fitnessLevel: string;
  muscleGroups?: string[];
}): string {
  const { goal, durationMinutes, equipment, fitnessLevel, muscleGroups } = params;

  let prompt = `Create a ${durationMinutes}-minute workout plan with the following specifications:

- Goal: ${goal}
- Available equipment: ${equipment.join(', ')}
- Fitness level: ${fitnessLevel}`;

  if (muscleGroups && muscleGroups.length > 0) {
    prompt += `\n- Focus areas: ${muscleGroups.join(', ')}`;
  }

  prompt += `

Generate a complete workout plan following the JSON format above. Ensure the exercise count and volume aligns with the requested duration and fitness level.`;

  return prompt;
}

/**
 * Goal-specific prompt modifiers
 */
export const GOAL_PROMPTS: Record<string, string> = {
  build_muscle: 'Focus on hypertrophy with moderate rep ranges (8-12), compound movements, and sufficient volume for muscle growth.',
  lose_weight: 'Focus on high-intensity exercises with minimal rest, circuit-style training, and full-body movements to maximize calorie burn.',
  general_fitness: 'Create a balanced routine with a mix of strength and cardio elements, improving overall health and functional fitness.',
};

/**
 * Fitness level guidelines
 */
export const FITNESS_LEVEL_GUIDELINES: Record<string, { exerciseCount: string; sets: string; rest: string }> = {
  beginner: {
    exerciseCount: '3-5 exercises',
    sets: '2-3 sets per exercise',
    rest: '30-60 seconds rest between sets',
  },
  intermediate: {
    exerciseCount: '5-8 exercises',
    sets: '3-4 sets per exercise',
    rest: '60-90 seconds rest between sets',
  },
  advanced: {
    exerciseCount: '8-12 exercises',
    sets: '3-5 sets per exercise',
    rest: '60-120 seconds rest between sets',
  },
};

/**
 * Equipment-specific exercise suggestions
 */
export const EQUIPMENT_VARIATIONS: Record<string, string[]> = {
  dumbbells: ['dumbbell presses', 'dumbbell rows', 'dumbbell squats', 'dumbbell lunges', 'dumbbell deadlifts'],
  barbells: ['barbell squats', 'barbell bench press', 'barbell deadlift', 'barbell rows', 'overhead press'],
  kettlebells: ['kettlebell swings', 'kettlebell goblet squats', 'kettlebell rows', 'kettlebell presses', 'turkish getups'],
  bodyweight: ['push-ups', 'pull-ups', 'squats', 'lunges', 'planks', 'burpees', 'mountain climbers'],
};

/**
 * Muscle group focus combinations
 */
export const MUSCLE_GROUP_COMBINATIONS: Record<string, string[]> = {
  push: ['chest', 'shoulders', 'triceps'],
  pull: ['back', 'biceps'],
  legs: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
  core: ['core'],
  upper: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
  lower: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
  full: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'core', 'quadriceps', 'hamstrings', 'glutes'],
};

/**
 * Build enhanced user prompt with goal-specific context
 */
export function buildEnhancedWorkoutPrompt(params: {
  goal: string;
  durationMinutes: number;
  equipment: string[];
  fitnessLevel: string;
  muscleGroups?: string[];
}): string {
  const basePrompt = buildWorkoutPrompt(params);
  const goalGuidance = GOAL_PROMPTS[params.goal] || '';
  const levelGuidelines = FITNESS_LEVEL_GUIDELINES[params.fitnessLevel];

  let enhancedPrompt = basePrompt;

  if (goalGuidance) {
    enhancedPrompt += `\n\nGoal-specific guidance: ${goalGuidance}`;
  }

  if (levelGuidelines) {
    enhancedPrompt += `\n\nFor ${params.fitnessLevel} level: ${levelGuidelines.exerciseCount}, ${levelGuidelines.sets}, ${levelGuidelines.rest}`;
  }

  return enhancedPrompt;
}
