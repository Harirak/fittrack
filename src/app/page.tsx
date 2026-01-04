import Link from 'next/link';
import { Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="flex w-full max-w-4xl flex-col items-center text-center">
        {/* Logo */}
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary shadow-xl ring-1 ring-black/5 sm:h-28 sm:w-28 transition-transform hover:scale-105">
          <Dumbbell className="h-12 w-12 text-primary-foreground sm:h-14 sm:w-14" />
        </div>

        {/* Hero Text */}
        <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl tracking-tight">
          FitTrack Pro
        </h1>
        <p className="mb-8 max-w-xl text-lg text-muted-foreground sm:text-xl">
          Track your workouts, generate AI-powered fitness plans, and achieve your goals.
        </p>

        {/* CTA Buttons */}
        <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="flex-1 bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:scale-105"
          >
            <Link href="/sign-up">Get Started</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="flex-1 border-input bg-background text-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:scale-105"
          >
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>

        {/* Features */}
        <div className="mt-12 grid w-full gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-card p-5 shadow-sm ring-1 ring-border transition-all duration-200 hover:shadow-md hover:scale-105">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <span className="text-lg">🏃</span>
            </div>
            <h3 className="font-semibold text-foreground">Track Workouts</h3>
            <p className="mt-1 text-sm text-muted-foreground">Log treadmill and strength training sessions</p>
          </div>
          <div className="rounded-xl bg-card p-5 shadow-sm ring-1 ring-border transition-all duration-200 hover:shadow-md hover:scale-105">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <span className="text-lg">🤖</span>
            </div>
            <h3 className="font-semibold text-foreground">AI Plans</h3>
            <p className="mt-1 text-sm text-muted-foreground">Generate personalized workout routines</p>
          </div>
          <div className="rounded-xl bg-card p-5 shadow-sm ring-1 ring-border transition-all duration-200 hover:shadow-md hover:scale-105">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <span className="text-lg">📊</span>
            </div>
            <h3 className="font-semibold text-foreground">Track Progress</h3>
            <p className="mt-1 text-sm text-muted-foreground">View your fitness journey over time</p>
          </div>
          <div className="rounded-xl bg-card p-5 shadow-sm ring-1 ring-border transition-all duration-200 hover:shadow-md hover:scale-105">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <span className="text-lg">💪</span>
            </div>
            <h3 className="font-semibold text-foreground">Exercise Library</h3>
            <p className="mt-1 text-sm text-muted-foreground">Browse 50+ exercises by equipment</p>
          </div>
        </div>
      </div>
    </div>
  );
}
