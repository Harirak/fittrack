'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Target, Clock, ArrowRight, Trash2 } from 'lucide-react';
import { Goal } from '@/types';
import { cn } from '@/lib/utils';

export type PlanCardProps = {
  id: string;
  name: string;
  goal: Goal;
  durationMinutes: number;
  exerciseCount: number;
  isAiGenerated?: boolean;
  onView?: () => void;
  onStart?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
};

const GOAL_CONFIG: Record<Goal, { label: string; icon: any; color: string }> = {
  build_muscle: { label: 'Build Muscle', icon: Dumbbell, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  lose_weight: { label: 'Lose Weight', icon: Target, color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  general_fitness: { label: 'General Fitness', icon: Target, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
};

export function PlanCard({
  name,
  goal,
  durationMinutes,
  exerciseCount,
  isAiGenerated = false,
  onView,
  onStart,
  onDelete,
  showActions = true,
}: PlanCardProps) {
  const goalConfig = GOAL_CONFIG[goal];
  const GoalIcon = goalConfig.icon;

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">{name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              {isAiGenerated && (
                <Badge variant="secondary" className="text-xs">
                  AI Generated
                </Badge>
              )}
            </CardDescription>
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Goal Badge */}
        <Badge className={cn('w-fit', goalConfig.color)}>
          <GoalIcon className="h-3 w-3 mr-1" />
          {goalConfig.label}
        </Badge>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{durationMinutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Dumbbell className="h-4 w-4" />
            <span>{exerciseCount} exercises</span>
          </div>
        </div>
      </CardContent>

      {showActions && (onView || onStart) && (
        <CardFooter className="pt-3 gap-2">
          {onView && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={onView}
            >
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {onStart && (
            <Button
              className="flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
              onClick={onStart}
            >
              Start Workout
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
