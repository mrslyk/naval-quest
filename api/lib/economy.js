/**
 * Naval Quest economy — shop, sponsor tiers, BTC cashout, level-scaled rewards.
 *
 * Reward schedule (matches rising difficulty):
 *   amount(level) = base + (level - 1) * step
 *   base = NAVAL_LEVEL_REWARD_AMOUNT (default 10)
 *   step = NAVAL_LEVEL_REWARD_STEP (default 1)
 *   → Level 1 = 10 NAV … Level 39 = 48 NAV
 */

import { rewardAssetCode, rewardAssetSymbol } from './slyk.js';

export const TOTAL_LEVELS = 39;

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

export function rewardBaseAmount() {
  return Number(process.env.NAVAL_LEVEL_REWARD_AMOUNT || '10');
}

export function rewardStepAmount() {
  return Number(process.env.NAVAL_LEVEL_REWARD_STEP || '1');
}

/** Flat base (legacy helper) — prefer rewardAmountForLevel(level). */
export function levelRewardAmount() {
  return String(rewardBaseAmount());
}

/** NAV awarded for clearing a given level (1–39). Always increases with level. */
export function rewardAmountForLevel(level) {
  const n = Math.max(1, Math.min(TOTAL_LEVELS, Number(level) || 1));
  return rewardBaseAmount() + (n - 1) * rewardStepAmount();
}

export function rewardLabelForLevelNum(level) {
  return `${rewardAmountForLevel(level)} ${rewardAssetSymbol()}`;
}

export function allLevelRewards() {
  return Array.from({ length: TOTAL_LEVELS }, (_, i) => {
    const level = i + 1;
    const amount = rewardAmountForLevel(level);
    return {
      level,
      amount,
      amountLabel: `${amount} ${rewardAssetSymbol()}`,
      band: level <= 13 ? 'easy' : level <= 26 ? 'medium' : 'hard',
    };
  });
}

export function economyMeta() {
  const symbol = rewardAssetSymbol();
  return {
    rewardAsset: rewardAssetCode(),
    rewardSymbol: symbol,
    levelReward: String(rewardBaseAmount()),
    levelRewardStep: String(rewardStepAmount()),
    /** Per-level schedule for UI (grid, previews) */
    levelRewards: allLevelRewards(),
    shop: Object.values(SHOP_ITEMS).map((item) => ({
      ...item,
      priceLabel: `${item.price} ${symbol}`,
    })),
    sponsorTiers: SPONSOR_TIERS,
    cashoutTargets: CASHOUT_TARGETS,
  };
}
