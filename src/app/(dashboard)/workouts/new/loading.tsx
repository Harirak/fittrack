import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function NewWorkoutLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border/50 px-4 py-3">
        <Skeleton className="h-6 w-24" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Workout Type Selection Skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <Card key={i} className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <Skeleton className="h-12 w-12 mx-auto mb-3 rounded-lg" />
              <Skeleton className="h-5 w-28 mx-auto" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
