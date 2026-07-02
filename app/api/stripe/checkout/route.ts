import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as { interval: 'monthly' | 'yearly' }
    const { interval } = body

    if (interval !== 'monthly' && interval !== 'yearly') {
      return NextResponse.json(
        { success: false, error: 'Invalid interval. Must be "monthly" or "yearly".' },
        { status: 400 }
      )
    }

    const priceId = interval === 'monthly'
      ? process.env.STRIPE_PRICE_MONTHLY!
      : process.env.STRIPE_PRICE_YEARLY!

    // Check if user already has a Stripe customer ID
    const user = await prisma.user.findUnique({
      where:  { id: session.user.id },
      select: { stripeCustomerId: true, email: true, name: true },
    })

    let customerId = user?.stripeCustomerId

    // Create Stripe customer if not exists
    if (!customerId) {
      const customer = await stripe.customers.create({
        email:    user?.email ?? session.user.email ?? undefined,
        name:     user?.name ?? session.user.name ?? undefined,
        metadata: { userId: session.user.id },
      })
      customerId = customer.id

      await prisma.user.update({
        where: { id: session.user.id },
        data:  { stripeCustomerId: customerId },
      })
    }

    // Create Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer:             customerId,
      mode:                 'subscription',
      payment_method_types: ['card'],
      currency:             'inr',
      line_items: [
        {
          price:    priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
      },
      success_url: `${process.env.NEXTAUTH_URL}/upgrade?success=true`,
      cancel_url:  `${process.env.NEXTAUTH_URL}/upgrade?canceled=true`,
    })

    return NextResponse.json({
      success: true,
      data:    { url: checkoutSession.url },
    })
  } catch (err) {
    console.error('[STRIPE CHECKOUT ERROR]', err)
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
