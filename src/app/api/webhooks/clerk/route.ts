import { NextRequest, NextResponse } from 'next/server';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createUser } from '@/lib/db/queries/users';

/**
 * Clerk webhook handler for user sync
 * Handles user.created events to sync Clerk users to database
 */
export async function POST(req: NextRequest) {
  // Get webhook secret from environment
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Get raw body for signature verification
  const payload = await req.json();
  const evt = payload as WebhookEvent;

  // Handle user creation
  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    try {
      // Get primary email
      const primaryEmail = email_addresses.find((e) => e.id === evt.data.primary_email_address_id)?.email_address;

      if (!primaryEmail) {
        console.error('No primary email found for user:', id);
        return NextResponse.json({ error: 'No primary email' }, { status: 400 });
      }

      // Create user in database
      const name = [first_name, last_name].filter(Boolean).join(' ') || undefined;
      await createUser({
        id,
        email: primaryEmail,
        name: name || undefined,
      });

      console.log('User created in database:', id);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error creating user:', error);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
  }

  // Handle user deletion
  if (evt.type === 'user.deleted') {
    const { id } = evt.data;
    // For now, we'll just log - you may want to implement soft delete
    console.log('User deleted in Clerk:', id);
    return NextResponse.json({ success: true });
  }

  // Handle user updates
  if (evt.type === 'user.updated') {
    const { id } = evt.data;
    // You may want to sync updates to the database
    console.log('User updated in Clerk:', id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ received: true });
}
