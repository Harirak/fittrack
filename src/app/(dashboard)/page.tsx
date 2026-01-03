import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/index';
import { schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { DashboardClient } from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Check if user has any workouts (for empty state)
  let hasWorkouts = false;
  try {
    const userWorkouts = await db.query.workouts.findMany({
      where: eq(schema.workouts.userId, user.id),
      limit: 1,
    });
    hasWorkouts = userWorkouts.length > 0;
  } catch (error) {
    // If there's an error, we'll let the client handle it
    console.error('Error checking workouts:', error);
  }

  return <DashboardClient initialHasWorkouts={hasWorkouts} />;
}
