export const SLYK_DASHBOARD_URL =
  import.meta.env.VITE_SLYK_DASHBOARD_URL ?? 'https://naval.slyk.io/dashboard?locale=en';

export const SLYK_PAYSPACE_ORIGIN =
  import.meta.env.VITE_SLYK_PAYSPACE_ORIGIN ?? 'https://naval.slyk.io';

export const SLYK_API_HOST = import.meta.env.VITE_SLYK_API_HOST ?? 'api.slyk.io';

const REFERRAL_KEY = 'naval-quest-referral';

export interface SlykContext {
  taskId: string | null;
  slug: string | null;
  userId: string | null;
  referral: string | null;
  embedded: boolean;
}

export function getSlykContext(): SlykContext {
  if (typeof window === 'undefined') {
    return { taskId: null, slug: null, userId: null, referral: null, embedded: false };
  }

  const params = new URLSearchParams(window.location.search);
  const referralFromUrl = params.get('referral') ?? params.get('code');

  if (referralFromUrl) {
    try {
      sessionStorage.setItem(REFERRAL_KEY, referralFromUrl);
    } catch {
      /* private mode */
    }
  }

  let storedReferral: string | null = null;
  try {
    storedReferral = sessionStorage.getItem(REFERRAL_KEY);
  } catch {
    /* ignore */
  }

  return {
    taskId: params.get('taskId'),
    slug: params.get('slug') ?? 'naval',
    userId: params.get('userId'),
    referral: referralFromUrl ?? storedReferral,
    embedded: Boolean(
      (window as unknown as { ReactNativeWebView?: unknown }).ReactNativeWebView ||
        params.get('embedded') === '1'
    ),
  };
}

export function dashboardUrl(locale = 'en'): string {
  const ctx = getSlykContext();
  const base = SLYK_DASHBOARD_URL.split('?')[0];
  const url = new URL(base);
  url.searchParams.set('locale', locale);
  if (ctx.slug) url.searchParams.set('slug', ctx.slug);
  return url.toString();
}

export function payspaceUrl(path = '/'): string {
  const base = SLYK_PAYSPACE_ORIGIN.replace(/\/$/, '');
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
}
