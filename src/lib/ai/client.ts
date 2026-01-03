// AI client for workout plan generation using OpenAI SDK with LiteLLM
import OpenAI from 'openai';

// Get LiteLLM endpoint from environment variables
const LITELLM_API_KEY = process.env.LITELLM_API_KEY;
const LITELLM_BASE_URL = process.env.LITELLM_BASE_URL || 'http://localhost:4000';

if (!LITELLM_API_KEY) {
  console.warn('LITELLM_API_KEY not set, AI features will be disabled');
}

// Initialize OpenAI client with LiteLLM configuration
export const aiClient = LITELLM_API_KEY
  ? new OpenAI({
      apiKey: LITELLM_API_KEY,
      baseURL: LITELLM_BASE_URL,
    })
  : null;

/**
 * Generate a workout plan using AI
 */
export async function generateWorkoutPlan(params: {
  goal: string;
  durationMinutes: number;
  equipment: string[];
  fitnessLevel: string;
  muscleGroups?: string[];
}) {
  if (!aiClient) {
    throw new Error('AI client not configured. Please set LITELLM_API_KEY environment variable.');
  }

  const { goal, durationMinutes, equipment, fitnessLevel, muscleGroups } = params;

  // Build the prompt
  const systemPrompt = `You are an expert fitness coach specializing in home workout routines.
Generate structured workout plans based on user goals, available equipment, and fitness level.

Always respond with valid JSON in this exact format:
{
  "name": "Workout Name",
  "description": "Brief description of the workout",
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
- Include a balanced mix of muscle groups when appropriate`;

  const userPrompt = `Create a ${durationMinutes}-minute workout plan with the following specifications:

- Goal: ${goal}
- Available equipment: ${equipment.join(', ')}
- Fitness level: ${fitnessLevel}
${muscleGroups ? `- Focus areas: ${muscleGroups.join(', ')}` : ''}

Generate a complete workout plan following the JSON format above.`;

  try {
    const response = await aiClient.chat.completions.create({
      model: 'gpt-4o-mini', // Use a cost-effective model via LiteLLM
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from AI');
    }

    // Parse the JSON response
    const workoutPlan = JSON.parse(content);

    // Validate the response structure
    if (!workoutPlan.name || !Array.isArray(workoutPlan.exercises)) {
      throw new Error('Invalid AI response format');
    }

    return workoutPlan;
  } catch (error) {
    console.error('AI generation error:', error);
    throw error;
  }
}

/**
 * Check if AI client is configured and available
 */
export function isAiClientAvailable(): boolean {
  return aiClient !== null;
}
