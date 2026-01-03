// Clerk authentication middleware for FitTrack Pro MVP
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define protected routes (require authentication)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/workouts(.*)',
  '/exercises(.*)',
  '/plans(.*)',
  '/profile(.*)',
  '/onboarding(.*)',
]);

// Define public routes (don't require authentication)
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/',
]);

// Routes that bypass onboarding check
const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // Get user session
  const session = await auth();

  // Redirect authenticated users from public pages to home
  if (isPublicRoute(req)) {
    if (session.userId && req.nextUrl.pathname === '/') {
      const url = req.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();

    // Check if user needs to complete onboarding
    if (session.userId && !isOnboardingRoute(req)) {
      // Fetch user to check onboarding status
      try {
        const userResponse = await fetch(
          new URL('/api/user/profile', req.url),
          {
            headers: {
              // Forward the cookie to authenticate
              cookie: req.headers.get('cookie') ?? '',
            },
          }
        );

        if (userResponse.ok) {
          const user = await userResponse.json();
          if (!user.onboardingCompleted && req.nextUrl.pathname !== '/onboarding') {
            // Redirect to onboarding
            const url = req.nextUrl.clone();
            url.pathname = '/onboarding';
            return NextResponse.redirect(url);
          }
        }
      } catch (error) {
        // If we can't fetch the user, continue without redirecting
        console.error('Error checking onboarding status:', error);
      }
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
