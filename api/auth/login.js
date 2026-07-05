import { slykRequest, slykGet } from '../lib/slyk.js';
import { writeSession } from '../lib/session.js';
import { readBody } from '../lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = await readBody(req);
  if (!email?.trim() || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const auth = await slykRequest('POST', '/auth/token', {
      body: { email: email.trim().toLowerCase(), password },
    });

    if (auth.twoFactorId) {
      return res.status(403).json({ error: 'Two-factor auth is enabled; use the Slyk app for now.' });
    }

    const validated = await slykRequest('POST', '/auth/token/validate', {
      body: { token: auth.token },
    });
    const user = validated.user || (await slykGet(`/users/${validated.id}`));

    writeSession(res, {
      userId: user.id,
      token: auth.token,
      refreshToken: auth.refreshToken,
      email: user.email,
      name: user.name,
      primaryWalletId: user.primaryWalletId,
      referralCode: user.referralCode,
    });

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        referralCode: user.referralCode,
        primaryWalletId: user.primaryWalletId,
      },
    });
  } catch (err) {
    return res.status(err.status || 401).json({ error: err.message || 'Invalid credentials' });
  }
}
