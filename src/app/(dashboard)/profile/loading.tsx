import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border/50 px-4 py-3">
        <Skeleton className="h-6 w-20" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Profile Section Skeleton */}
        <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Separator className="mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>

        {/* Equipment Section Skeleton */}
        <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </Card>

        {/* Goals Section Skeleton */}
        <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
          <Skeleton className="h-5 w-24 mb-4" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
