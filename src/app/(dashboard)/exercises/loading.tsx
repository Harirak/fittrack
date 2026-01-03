import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function ExercisesLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border/50 px-4 py-3">
        <Skeleton className="h-6 w-24" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Filter Bar Skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Skeleton className="h-9 w-24 shrink-0" />
          <Skeleton className="h-9 w-32 shrink-0" />
          <Skeleton className="h-9 w-28 shrink-0" />
          <Skeleton className="h-9 w-28 shrink-0" />
        </div>

        {/* Exercise Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
              <Skeleton className="h-5 w-32 mb-2" />
              <div className="flex flex-wrap gap-1 mb-3">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full mb-1" />
              <Skeleton className="h-3 w-3/4" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
