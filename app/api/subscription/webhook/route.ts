import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan || 'basic';

        if (userId && session.subscription) {
          // Update subscription in database
          await prisma.subscription.update({
            where: { userId },
            data: {
              plan: plan,
              status: 'active',
              stripeId: session.subscription as string,
              renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              postsThisMonth: 0, // Reset counter on plan change
              resetDate: new Date(),
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeId = subscription.id;

        // Update subscription status
        await prisma.subscription.updateMany({
          where: { stripeId },
          data: {
            status: subscription.status === 'active' ? 'active' : 'canceled',
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeId = subscription.id;

        // Downgrade to free plan
        await prisma.subscription.updateMany({
          where: { stripeId },
          data: {
            plan: 'free',
            status: 'canceled',
          },
        });
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

