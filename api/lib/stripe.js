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
  return (
    process.env.NAVAL_GAME_ORIGIN ||
    process.env.SLYK_PAYSPACE_ORIGIN ||
    'https://navalgame.netlify.app'
  ).replace(/\/$/, '');
}

export function formatUsd(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    Number(cents) / 100
  );
}
