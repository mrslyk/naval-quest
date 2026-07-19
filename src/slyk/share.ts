import { getSlykContext, payspaceUrl } from './config';
import { PayspaceSnapshot } from './payspace';

export function buildShareUrl(data: PayspaceSnapshot | null): string {
  const ctx = getSlykContext();
  const slug = ctx.slug ?? 'naval';

  if (data?.invite?.gameUrl) {
    return data.invite.gameUrl;
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : payspaceUrl('');
  const url = new URL(origin.includes('localhost') ? payspaceUrl('/') : origin);
  url.searchParams.set('slug', slug);
  if (ctx.referral) url.searchParams.set('referral', ctx.referral);
  return url.toString();
}

export function shareMessage(data: PayspaceSnapshot | null): string {
  const pct = data?.referral?.earnPercentage;
  const symbol = data?.rewardAsset?.symbol ?? 'NVL';
  const perLevel = data?.levelRewards?.defaultAmountLabel ?? `real ${symbol}`;
  const referralLine = pct
    ? ` Invite friends — you earn ${pct}% of what they win.`
    : ' Invite friends and earn when they play.';
  return `I'm playing Naval Quest — earn rising ${symbol} rewards each level (from ${perLevel}).${referralLine} ${buildShareUrl(data)}`;
}

export async function copyShareLink(data: PayspaceSnapshot | null): Promise<boolean> {
  const text = shareMessage(data);
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function nativeShare(data: PayspaceSnapshot | null): Promise<boolean> {
  const url = buildShareUrl(data);
  const text = shareMessage(data);
  if (!navigator.share) return copyShareLink(data);
  try {
    await navigator.share({ title: 'Naval Quest', text, url });
    return true;
  } catch {
    return false;
  }
}
