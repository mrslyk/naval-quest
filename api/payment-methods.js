import { slykList } from './lib/slyk.js';
import { getSlykConfig } from './lib/slyk.js';
import { pickFundingMethods } from './lib/payment-instructions.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { apiKey } = getSlykConfig();
  if (!apiKey) {
    return res.status(503).json({ error: 'SLYK_API_KEY not configured' });
  }

  try {
    const [methods, settings] = await Promise.all([
      slykList('/payment-methods', { page: 1, size: 50 }),
      slykList('/settings', { page: 1, size: 100 }).catch(() => []),
    ]);

    const supportEmail = settings.find((s) => s.code === 'supportEmail')?.value || 'plg@slyk.io';
    const payspaceOrigin = process.env.SLYK_PAYSPACE_ORIGIN || 'https://naval.slyk.io';

    const funding = pickFundingMethods(
      methods.map((m) => ({
        slug: m.slug,
        name: m.name,
        assets: m.assets || [],
        featured: m.featured,
        imageUrl: m.image?.url || null,
      }))
    );

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ supportEmail, payspaceOrigin, methods: funding });
  } catch (err) {
    return res.status(500).json({ error: String(err?.message || err) });
  }
}
