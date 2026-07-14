import Stripe from 'stripe';

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    const err = new Error('STRIPE_SECRET_KEY not configured on Netlify');
    err.status = 503;
    throw err;
  }
  return new Stripe(key);
}

export function gameOrigin() {
  const fallback = 'https://navalgame.netlify.app';
  const raw = String(
    process.env.NAVAL_GAME_ORIGIN ||
      process.env.SLYK_PAYSPACE_ORIGIN ||
      fallback
  ).trim();

  for (const candidate of [raw, raw.match(/https?:\/\/[^\s]+/)?.[0]]) {
    if (!candidate) continue;
    try {
      const u = new URL(candidate.replace(/\/$/, ''));
      if (u.protocol === 'http:' || u.protocol === 'https:') return u.origin;
    } catch {
      /* try next */
    }
  }

  return fallback;
}

export function formatUsd(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    Number(cents) / 100
  );
}
