/**
 * Client-side mirror of api/lib/economy.js reward schedule.
 * amount(level) = base + (level - 1) * step  → L1=10 … L39=48 by default.
 */
export const TOTAL_LEVELS = 39;
export const REWARD_BASE = 10;
export const REWARD_STEP = 1;

export function rewardAmountForLevel(level: number, base = REWARD_BASE, step = REWARD_STEP): number {
  const n = Math.max(1, Math.min(TOTAL_LEVELS, Number(level) || 1));
  return base + (n - 1) * step;
}

export function rewardLabelForLevel(
  level: number,
  symbol = 'NAV',
  base = REWARD_BASE,
  step = REWARD_STEP
): string {
  return `${rewardAmountForLevel(level, base, step)} ${symbol}`;
}
