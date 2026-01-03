'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewWorkoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('New workout error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-card/50 backdrop-blur-sm border-border/50 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-2">Failed to start workout</h2>

        <p className="text-muted-foreground mb-6">
          We couldn&apos;t start a new workout. Please try again.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            onClick={reset}
            className="w-full bg-gradient-to-r from-primary to-primary/90"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          <Link href="/workouts" className="w-full">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Workouts
            </Button>
          </Link>
        </div>

        {error.digest && (
          <p className="mt-4 text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
      </Card>
    </div>
  );
}
