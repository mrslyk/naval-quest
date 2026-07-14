/**
 * Create Stripe Checkout for Naval Quest patron sponsorship (Option 1 — direct to your Stripe balance).
 */
import { readBody } from './lib/http.js';
import { SPONSOR_TIERS } from './lib/economy.js';
import { getStripe, gameOrigin } from './lib/stripe.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = await readBody(req);
  const tierId = body.tierId;
  const customAmount = body.customAmount != null ? Number(body.customAmount) : null;
  const sponsorName = String(body.sponsorName || '').trim().slice(0, 120);
  const sponsorMessage = String(body.sponsorMessage || '').trim().slice(0, 500);

  let amountCents;
  if (tierId === 'custom') {
    if (!customAmount || customAmount < 10) {
      return res.status(400).json({ error: 'Minimum sponsorship is $10' });
    }
    amountCents = Math.round(customAmount * 100);
  } else {
    const tier = SPONSOR_TIERS.find((t) => t.id === tierId);
    if (!tier) return res.status(400).json({ error: 'Choose a sponsorship tier' });
    amountCents = tier.amountCents;
  }

  if (amountCents > 10_000_000) {
    return res.status(400).json({ error: 'Maximum single sponsorship is $100,000' });
  }

  try {
    const stripe = getStripe();
    const origin = gameOrigin();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: {
              name: 'Naval Quest — Prize Pool Sponsorship',
              description:
                'Fund the play-to-earn game so players earn NAV for learning Naval’s wealth framework.',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/?sponsor=thanks&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?sponsor=cancel`,
      metadata: {
        game: 'naval-quest',
        sponsorName,
        sponsorMessage,
        amountCents: String(amountCents),
      },
      ...(sponsorName ? { customer_email: undefined } : {}),
    });

    return res.status(200).json({
      ok: true,
      url: session.url,
      sessionId: session.id,
      amountCents,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      error: err.message || String(err),
      hint: 'Set STRIPE_SECRET_KEY (live) in Netlify environment variables.',
    });
  }
}
