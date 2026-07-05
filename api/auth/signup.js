import { slykPost, slykRequest } from '../lib/slyk.js';
import { writeSession } from '../lib/session.js';
import { readBody } from '../lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, password, referral } = await readBody(req);
  if (!email?.trim() || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const payload = {
      name: name?.trim() || email.split('@')[0],
      email: email.trim().toLowerCase(),
      password,
      verified: true,
    };
    if (referral) payload.code = referral;

    const user = await slykPost('/users', payload);
    const auth = await slykRequest('POST', '/auth/token', {
      body: { email: payload.email, password },
    });

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
    return res.status(err.status || 500).json({ error: err.message || String(err) });
  }
}
