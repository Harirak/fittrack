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

export default clerkMiddleware(async (auth, req) => {
  // Redirect authenticated users from public pages to dashboard
  if (isPublicRoute(req)) {
    const session = await auth();
    if (session.userId && req.nextUrl.pathname === '/') {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
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
