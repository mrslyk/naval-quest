/**
 * Stripe webhook — records completed patron sponsorships (raw body for signature verification).
 */
import Stripe from 'stripe';
import { recordSponsorship } from '../../api/lib/store.js';

export default async (request) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!secret || !stripeKey) {
    return new Response(JSON.stringify({ error: 'Stripe webhook not configured' }), { status: 503 });
  }

  const stripe = new Stripe(stripeKey);
  const sig = request.headers.get('stripe-signature');
  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error('[stripe-webhook] signature', err.message);
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    if (session.metadata?.game !== 'naval-quest') {
      return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200 });
    }

    const amountCents = session.amount_total ?? Number(session.metadata?.amountCents) ?? 0;
    await recordSponsorship({
      amountCents,
      sponsorName: session.metadata?.sponsorName,
      sponsorMessage: session.metadata?.sponsorMessage,
      stripeSessionId: session.id,
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
