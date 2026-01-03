import Link from 'next/link';
import { Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-violet-600 to-pink-500 p-4">
      <div className="flex max-w-md flex-col items-center text-center">
        {/* Logo */}
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <Dumbbell className="h-10 w-10 text-white" />
        </div>

        {/* Hero Text */}
        <h1 className="mb-4 text-4xl font-bold text-white">
          FitTrack Pro
        </h1>
        <p className="mb-8 text-lg text-white/90">
          Track your workouts, generate AI-powered fitness plans, and achieve your goals.
        </p>

        {/* CTA Buttons */}
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="flex-1 bg-white text-purple-600 hover:bg-white/90"
          >
            <Link href="/sign-up">Get Started</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="flex-1 border-white/50 bg-transparent text-white hover:bg-white/10"
          >
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>

        {/* Features */}
        <div className="mt-12 grid gap-4 text-left sm:grid-cols-2">
          <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <span className="text-sm">🏃</span>
            </div>
            <h3 className="font-semibold text-white">Track Workouts</h3>
            <p className="text-sm text-white/80">Log treadmill and strength training sessions</p>
          </div>
          <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <span className="text-sm">🤖</span>
            </div>
            <h3 className="font-semibold text-white">AI Plans</h3>
            <p className="text-sm text-white/80">Generate personalized workout routines</p>
          </div>
          <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <span className="text-sm">📊</span>
            </div>
            <h3 className="font-semibold text-white">Track Progress</h3>
            <p className="text-sm text-white/80">View your fitness journey over time</p>
          </div>
          <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <span className="text-sm">💪</span>
            </div>
            <h3 className="font-semibold text-white">Exercise Library</h3>
            <p className="text-sm text-white/80">Browse 50+ exercises by equipment</p>
          </div>
        </div>
      </div>
    </div>
  );
}
