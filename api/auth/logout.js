import { clearSession, readSession } from '../lib/session.js';
import { slykRequest } from '../lib/slyk.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = readSession(req);
  if (session?.refreshToken) {
    try {
      await slykRequest('POST', '/auth/token/revoke', {
        body: { refreshToken: session.refreshToken },
      });
    } catch {
      /* ignore */
    }
  }

  clearSession(res);
  return res.status(200).json({ ok: true });
}
