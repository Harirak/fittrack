import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>

        {/* Activity Ring Skeleton */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex items-center justify-center">
            <Skeleton className="h-40 w-40 rounded-full" />
          </div>
        </Card>

        {/* Weekly Chart Skeleton */}
        <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
          <Skeleton className="h-6 w-24 mb-4" />
          <div className="flex items-end justify-between h-32 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-full w-full" />
            ))}
          </div>
        </Card>

        {/* Recent Workouts Skeleton */}
        <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
