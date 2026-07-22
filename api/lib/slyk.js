/**
 * Shared Slyk REST helpers for Vercel serverless routes.
 */

export function getSlykConfig() {
  const apiKey = process.env.SLYK_API_KEY || process.env.SLYK_API_NAV;
  const host = process.env.SLYK_API_HOST || 'api.slyk.io';
  return { apiKey, host };
}

export function rewardAssetCode() {
  return process.env.NAVAL_REWARD_ASSET || 'nvl';
}

export function rewardAssetSymbol() {
  return process.env.NAVAL_REWARD_SYMBOL || 'NAV';
}

async function parseResponse(res, path) {
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* not json */
  }
  if (!res.ok) {
    const message =
      json?.message ||
      json?.code ||
      (json?.errors ? JSON.stringify(json.errors) : null) ||
      text ||
      `Slyk ${path} failed: ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json?.data ?? json;
}

export async function slykRequest(method, path, { body, params, token } = {}) {
  const { apiKey, host } = getSlykConfig();
  if (!apiKey && !token) {
    throw new Error('SLYK_API_KEY not configured');
  }

  const url = new URL(`https://${host}${path}`);
  for (const [key, value] of Object.entries(params || {})) {
    if (value != null) url.searchParams.set(key, String(value));
  }

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  else headers.apikey = apiKey;

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  return parseResponse(res, path);
}

export async function slykGet(path, params = {}) {
  return slykRequest('GET', path, { params });
}

export async function slykPost(path, body = {}) {
  return slykRequest('POST', path, { body });
}

export async function slykPatch(path, body = {}) {
  return slykRequest('PATCH', path, { body });
}

export async function slykList(path, { page = 1, size = 20, filters = [] } = {}) {
  const params = {
    'page[number]': page,
    'page[size]': size,
  };

  filters.forEach((filter, index) => {
    params[`filter[${index}][name]`] = filter.name;
    params[`filter[${index}][value]`] = filter.value;
  });

  const data = await slykGet(path, params);
  return Array.isArray(data) ? data : [];
}

export async function widgetPost(path, body, token) {
  const { host } = getSlykConfig();
  const slug = process.env.SLYK_PAYSPACE_SLUG || 'naval';
  const res = await fetch(`https://${host}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-payspace-slug': slug,
    },
    body: JSON.stringify({ ...body, domain: slug }),
  });
  return parseResponse(res, path);
}

export async function getMasterWalletId() {
  const settings = await slykList('/settings', { page: 1, size: 100 });
  return settings.find((s) => s.code === 'masterWalletId')?.value || null;
}

export async function getUser(userId) {
  return slykGet(`/users/${userId}`);
}

export async function getWalletBalances(walletId) {
  const data = await slykGet(`/wallets/${walletId}/balance`);
  return Array.isArray(data) ? data : [];
}

export function balanceOf(balances, assetCode) {
  const row = (balances || []).find((b) => b.assetCode === assetCode);
  return row ? String(row.amount) : '0';
}
