import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function PlansLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Plans Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
              <Skeleton className="h-6 w-40 mb-2" />
              <div className="flex gap-3 mb-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-3 w-full mb-1" />
              <Skeleton className="h-3 w-2/3 mb-3" />
              <Skeleton className="h-9 w-full" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
