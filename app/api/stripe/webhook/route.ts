import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    console.error('[STRIPE WEBHOOK] Missing signature')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[STRIPE WEBHOOK] Signature verification failed: ${message}`)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log(`[STRIPE WEBHOOK] Event: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId  = session.metadata?.userId

        if (!userId) {
          console.error('[STRIPE WEBHOOK] No userId in session metadata')
          break
        }

        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id

        if (subscriptionId) {
          // Fetch the subscription to get the current period end
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          await prisma.user.update({
            where: { id: userId },
            data: {
              plan:                 'PRO',
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId:     typeof session.customer === 'string'
                ? session.customer
                : session.customer?.id ?? undefined,
              planExpiresAt:        new Date((subscription as any).current_period_end * 1000),
            },
          })

          console.log(`[STRIPE WEBHOOK] User ${userId} upgraded to PRO`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId   = typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id

        // Find user by stripeCustomerId
        const user = await prisma.user.findFirst({
          where:  { stripeCustomerId: customerId },
          select: { id: true },
        })

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan:                 'FREE',
              stripeSubscriptionId: null,
              planExpiresAt:        null,
            },
          })

          console.log(`[STRIPE WEBHOOK] User ${user.id} downgraded to FREE`)
        } else {
          console.warn(`[STRIPE WEBHOOK] No user found for customer ${customerId}`)
        }
        break
      }

      default:
        console.log(`[STRIPE WEBHOOK] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error('[STRIPE WEBHOOK] Handler error:', err)
    // Return 200 anyway to prevent Stripe from retrying on our logic errors
    return NextResponse.json({ received: true, error: 'Handler error' })
  }

  return NextResponse.json({ received: true })
}
