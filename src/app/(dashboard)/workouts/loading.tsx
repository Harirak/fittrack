import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function WorkoutsLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border/50 px-4 py-3">
        <Skeleton className="h-6 w-24" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Filter Bar Skeleton */}
        <Card className="p-3 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex gap-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 w-9" />
          </div>
        </Card>

        {/* Workout Cards Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
