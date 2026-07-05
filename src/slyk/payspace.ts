import { getSlykContext, payspaceUrl } from './config';

export interface PayspaceSnapshot {
  slug: string;
  rewardAsset: { code: string; symbol: string; decimalPlaces: number };
  prizePool: {
    kind: string;
    id: string;
    name: string;
    description?: string;
    goalLabel?: string | null;
    raisedLabel?: string | null;
    progress: number;
    fundUrl: string;
  } | null;
  funding: {
    id: string;
    name: string;
    description?: string;
    priceLabel?: string | null;
    fundUrl: string;
  } | null;
  quest: {
    id: string;
    name: string;
    amountLabel?: string | null;
    taskUrl: string;
  } | null;
  levelRewards: {
    totalLevels: number;
    defaultAmountLabel: string | null;
    mappedCount: number;
    perLevel: Array<{ level: number; taskId: string; name: string; amountLabel?: string | null }>;
  };
  referral: {
    earnEnabled: boolean;
    earnPercentage: number | null;
    purchaseEnabled: boolean;
    purchasePercentage: number | null;
  };
  invite: {
    referralCode: string;
    gameUrl: string;
    payspaceUrl: string;
    shortUrl: string;
  } | null;
  tasks: Array<{ id: string; name: string; amountLabel?: string | null; taskUrl: string }>;
  links: {
    payspace: string;
    dashboard: string;
    addFunds: string;
    store: string;
    cashout: string;
    app: string;
    masterWalletAddFunds: string;
  };
}

let cache: PayspaceSnapshot | null = null;
let cacheAt = 0;
const CACHE_MS = 60_000;

export async function fetchPayspace(force = false): Promise<PayspaceSnapshot | null> {
  const now = Date.now();
  if (!force && cache && now - cacheAt < CACHE_MS) return cache;

  const ctx = getSlykContext();
  const slug = ctx.slug ?? 'naval';
  const qs = new URLSearchParams({ slug });
  if (ctx.userId) qs.set('userId', ctx.userId);

  try {
    const res = await fetch(`/api/payspace?${qs}`);
    if (!res.ok) return cache;
    const data = (await res.json()) as PayspaceSnapshot;
    cache = data;
    cacheAt = now;
    return data;
  } catch {
    return cache;
  }
}

export function primaryFundUrl(data: PayspaceSnapshot | null): string | null {
  if (!data) return null;
  return data.prizePool?.fundUrl ?? data.funding?.fundUrl ?? data.links.store;
}

export function perLevelRewardLabel(data: PayspaceSnapshot | null): string {
  if (!data) return 'NVL each level';
  const mapped = data.levelRewards?.perLevel?.[0]?.amountLabel;
  return mapped ?? data.levelRewards?.defaultAmountLabel ?? data.rewardAsset.symbol;
}

export function cashoutUrl(data: PayspaceSnapshot | null): string {
  return data?.links?.cashout ?? payspaceUrl('/dashboard/wallets');
}

export function signInUrl(): string {
  return payspaceUrl('/');
}
