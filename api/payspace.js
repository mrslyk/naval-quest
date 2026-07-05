/**
 * Vercel serverless — public prize pool + task snapshot for Naval Quest home.
 * Requires SLYK_API_KEY in project env.
 */
import { getPayspaceSnapshot } from './lib/payspace.js';
import { getSlykConfig } from './lib/slyk.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { apiKey } = getSlykConfig();
  if (!apiKey) {
    return res.status(503).json({ error: 'SLYK_API_KEY not configured' });
  }

  const slug = req.query?.slug || 'naval';
  const userId = req.query?.userId || null;

  try {
    const data = await getPayspaceSnapshot(slug, userId);
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: String(err?.message || err) });
  }
}
