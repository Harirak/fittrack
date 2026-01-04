// PWA manifest for FitTrack Pro MVP
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FitTrack Pro - Fitness Tracking',
    short_name: 'FitTrack Pro',
    description: 'Track your workouts, generate AI-powered fitness plans, and achieve your goals.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F6F6F6',
    theme_color: '#F6F6F6',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    categories: ['fitness', 'health', 'sports'],
    shortcuts: [
      {
        name: 'Start Workout',
        short_name: 'Workout',
        description: 'Start a new workout',
        url: '/workouts/new',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
          },
        ],
      },
      {
        name: 'View Exercises',
        short_name: 'Exercises',
        description: 'Browse exercise library',
        url: '/exercises',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
          },
        ],
      },
    ],
  };
}
