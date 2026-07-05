/**
 * Naval Quest economy: shop items, fund rails, cashout targets.
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

export const FUND_RAILS = [
  {
    id: 'stripe',
    name: 'Card (Stripe)',
    kind: 'fiat',
    code: 'card:stripe',
    assetCode: 'usd',
    description: 'Deposit USD with a credit or debit card.',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    kind: 'fiat',
    code: 'apm:paypal',
    assetCode: 'usd',
    description: 'Deposit USD via PayPal.',
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    kind: 'crypto',
    code: 'crypto:coinbase',
    assetCode: 'usdc',
    description: 'Deposit USDC / crypto via Coinbase.',
  },
];

export const CASHOUT_TARGETS = [
  { id: 'usd', assetCode: 'usd', label: 'USD (fiat)', withdrawCode: 'manual:paypal', rail: 'paypal' },
  { id: 'usdc', assetCode: 'usdc', label: 'USDC (crypto)', withdrawCode: 'manual:usdc', rail: 'coinbase' },
  { id: 'btc', assetCode: 'btc', label: 'BTC (crypto)', withdrawCode: 'manual:btc', rail: 'coinbase' },
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
    fundRails: FUND_RAILS,
    cashoutTargets: CASHOUT_TARGETS,
  };
}
