/**
 * Naval Quest economy — shop, sponsor tiers, BTC cashout via Coinbase on Slyk.
 */

import { rewardAssetCode, rewardAssetSymbol } from './slyk.js';

export const SHOP_ITEMS = {
  hint: {
    id: 'hint',
    name: 'Naval whisper',
    description: 'Reveal a stronger hint for this level.',
    price: 5,
    effect: 'hint',
  },
  reveal: {
    id: 'reveal',
    name: 'Reveal answer',
    description: 'Show the solution path for this level.',
    price: 15,
    effect: 'reveal',
  },
  skip: {
    id: 'skip',
    name: 'Skip level',
    description: 'Clear this level without solving (still earns NAV).',
    price: 25,
    effect: 'skip',
  },
};

/** Patron sponsorship tiers (USD) — Stripe Checkout on navalgame.netlify.app */
export const SPONSOR_TIERS = [
  { id: 'supporter', label: 'Supporter', amountUsd: 100, amountCents: 10_000 },
  { id: 'champion', label: 'Champion', amountUsd: 500, amountCents: 50_000 },
  { id: 'benefactor', label: 'Benefactor', amountUsd: 2_500, amountCents: 250_000 },
  { id: 'patron', label: 'Patron', amountUsd: 10_000, amountCents: 1_000_000 },
  { id: 'visionary', label: 'Visionary', amountUsd: 25_000, amountCents: 2_500_000 },
];

/** Player cashout: NAV → BTC only, withdraw via Coinbase on Slyk */
export const CASHOUT_TARGETS = [
  {
    id: 'btc',
    assetCode: 'btc',
    label: 'BTC (Coinbase)',
    withdrawCode: 'crypto:coinbase',
    rail: 'coinbase',
  },
];

export function levelRewardAmount() {
  return process.env.NAVAL_LEVEL_REWARD_AMOUNT || '10';
}

export function economyMeta() {
  return {
    rewardAsset: rewardAssetCode(),
    rewardSymbol: rewardAssetSymbol(),
    levelReward: levelRewardAmount(),
    shop: Object.values(SHOP_ITEMS).map((item) => ({
      ...item,
      priceLabel: `${item.price} ${rewardAssetSymbol()}`,
    })),
    sponsorTiers: SPONSOR_TIERS,
    cashoutTargets: CASHOUT_TARGETS,
  };
}
