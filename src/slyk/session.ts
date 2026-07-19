export interface SessionUser {
  id: string;
  email: string;
  name: string;
  referralCode?: string;
  primaryWalletId?: string;
}

export interface BalanceRow {
  assetCode: string;
  amount: string;
  label: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  priceLabel: string;
  effect: string;
}

export interface LevelRewardRow {
  level: number;
  amount: number;
  amountLabel: string;
  band: string;
}

export interface EconomyMeta {
  rewardAsset: string;
  rewardSymbol: string;
  levelReward: string;
  levelRewardStep?: string;
  levelRewards?: LevelRewardRow[];
  shop: ShopItem[];
  sponsorTiers: Array<{ id: string; label: string; amountUsd: number; amountCents?: number }>;
  cashoutTargets: Array<{
    id: string;
    assetCode: string;
    label: string;
    withdrawCode: string;
    rail: string;
  }>;
}

export interface MeResponse {
  user: SessionUser | null;
  balances?: BalanceRow[];
  nav?: string;
  navLabel?: string;
  economy: EconomyMeta;
}

let cached: MeResponse | null = null;

export async function api<T = unknown>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || `Request failed (${res.status})`) as Error & {
      status?: number;
      body?: unknown;
    };
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body as T;
}

export async function fetchMe(force = false): Promise<MeResponse> {
  if (!force && cached) return cached;
  cached = await api<MeResponse>('/api/auth/me');
  return cached;
}

export function clearMeCache(): void {
  cached = null;
}

export async function signup(data: {
  name: string;
  email: string;
  password: string;
  referral?: string | null;
}): Promise<MeResponse> {
  await api('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) });
  clearMeCache();
  return fetchMe(true);
}

export async function login(data: { email: string; password: string }): Promise<MeResponse> {
  await api('/api/auth/login', { method: 'POST', body: JSON.stringify(data) });
  clearMeCache();
  return fetchMe(true);
}

export async function logout(): Promise<void> {
  await api('/api/auth/logout', { method: 'POST', body: '{}' });
  clearMeCache();
}

export interface GameStats {
  sponsorshipTotalLabel: string;
  navWonLabel: string;
  btcWonLabel: string;
  leaderboard: Array<{
    rank: number;
    displayName: string;
    levelsCleared: number;
    navWon: number;
    btcWon: number;
  }>;
}

export async function fetchGameStats(): Promise<GameStats> {
  return api<GameStats>('/api/stats');
}

export async function syncServerProgress(data: {
  levelsCleared?: number;
  level?: number;
  navDelta?: number;
  btcDelta?: number;
  displayName?: string;
  recordLevelReward?: boolean;
}) {
  return api<{ ok: boolean; player: unknown }>('/api/progress', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchServerProgress() {
  return api<{
    signedIn: boolean;
    levelsCleared: number;
    displayName?: string;
    navWon?: number;
    btcWon?: number;
  }>('/api/progress');
}

export async function createSponsorCheckout(data: {
  tierId: string;
  customAmount?: number;
  sponsorName?: string;
  sponsorMessage?: string;
}) {
  return api<{ ok: boolean; url: string }>('/api/stripe/checkout', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function rollNavalBonus(data: {
  level: number;
  tweet: string;
  title: string;
  navalIntro: string;
}) {
  return api<{
    offer: boolean;
    reason?: string;
    questionId?: string;
    question?: string;
    hint?: string | null;
    bonusLabel?: string;
    navalLine?: string;
  }>('/api/bonus/roll', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function scoreNavalBonus(data: { questionId: string; answer: string }) {
  return api<{
    pass: boolean;
    score: number;
    feedback: string;
    paid: boolean;
    bonusLabel?: string | null;
    navLabel?: string | null;
    error?: string;
  }>('/api/bonus/score', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deposit(railId: string, amount: string) {
  return api<{
    ok: boolean;
    mode: string;
    redirectUrl?: string | null;
    message?: string;
    error?: string;
  }>('/api/deposit', {
    method: 'POST',
    body: JSON.stringify({ railId, amount }),
  });
}

export async function spend(itemId: string, level?: number) {
  return api<{
    ok: boolean;
    effect: string;
    spentLabel: string;
    navLabel: string;
  }>('/api/spend', {
    method: 'POST',
    body: JSON.stringify({ itemId, level }),
  });
}

export async function exchange(amount?: string) {
  return api<{
    ok: boolean;
    receivedLabel: string;
    nav: string;
  }>('/api/exchange', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}

export async function withdraw(data: {
  assetCode: string;
  amount?: string;
  destination: string;
  force?: boolean;
}) {
  return api<{ ok: boolean; message: string; status: string }>('/api/withdraw', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
