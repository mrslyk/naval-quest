/**
 * Kimi (Moonshot) OpenAI-compatible chat client.
 */
export function kimiConfig() {
  const apiKey =
    process.env.MOONSHOT_API_KEY || process.env.KIMI_API_KEY || process.env.KMI_NAV_API;
  const baseUrl = (process.env.KIMI_BASE_URL || 'https://api.moonshot.ai/v1').replace(/\/$/, '');
  const model = process.env.KIMI_MODEL || 'kimi-k3';
  return { apiKey, baseUrl, model };
}

/** kimi-k3 (and some Moonshot variants) only accept temperature=1. */
function resolveTemperature(model, requested) {
  const m = String(model || '').toLowerCase();
  if (m.includes('kimi-k3') || m.includes('k2.5') || m.includes('kimi-k2')) return 1;
  return requested;
}

export async function kimiChat({
  system,
  user,
  temperature = 0.4,
  json = false,
  timeoutMs = 12000,
}) {
  const { apiKey, baseUrl, model } = kimiConfig();
  if (!apiKey) {
    const err = new Error('MOONSHOT_API_KEY not configured');
    err.status = 503;
    throw err;
  }

  const body = {
    model,
    temperature: resolveTemperature(model, temperature),
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  };
  if (json) {
    body.response_format = { type: 'json_object' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(2000, timeoutMs));
  let res;
  try {
    res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err?.name === 'AbortError') {
      const timeoutErr = new Error('Kimi request timed out');
      timeoutErr.status = 504;
      throw timeoutErr;
    }
    throw err;
  }
  clearTimeout(timer);

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || `Kimi error ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  const text = data?.choices?.[0]?.message?.content ?? '';
  return { text, raw: data, model };
}

export function parseJsonFromModel(text) {
  const trimmed = String(text || '').trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const m = trimmed.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        /* fall through */
      }
    }
  }
  return null;
}
