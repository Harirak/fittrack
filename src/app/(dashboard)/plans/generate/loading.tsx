import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function GeneratePlanLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border/50 px-4 py-3">
        <Skeleton className="h-6 w-40" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Form Skeleton */}
        <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50 space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>

          <Skeleton className="h-5 w-28" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>

          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>

          <Skeleton className="h-11 w-full" />
        </Card>

        {/* Result Skeleton */}
        <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
          <Skeleton className="h-6 w-40 mb-3" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-11 w-full mt-4" />
        </Card>
      </div>
    </div>
  );
}
