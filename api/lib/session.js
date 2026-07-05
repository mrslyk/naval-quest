/**
 * Cookie session for Naval Quest BFF (user JWT + profile).
 */

const COOKIE = 'nq_session';
const MAX_AGE = 60 * 60 * 24 * 30;

function parseCookies(header = '') {
  return Object.fromEntries(
    header
      .split(';')
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => {
        const i = p.indexOf('=');
        return i === -1 ? [p, ''] : [p.slice(0, i), decodeURIComponent(p.slice(i + 1))];
      })
  );
}

export function readSession(req) {
  const cookies = parseCookies(req.headers?.cookie || '');
  const raw = cookies[COOKIE];
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

export function writeSession(res, session) {
  const value = Buffer.from(JSON.stringify(session), 'utf8').toString('base64url');
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader?.(
    'Set-Cookie',
    `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${secure}`
  );
}

export function clearSession(res) {
  res.setHeader?.(
    'Set-Cookie',
    `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
}

export function requireSession(req, res) {
  const session = readSession(req);
  if (!session?.userId || !session?.token) {
    res.status(401).json({ error: 'Sign in to continue' });
    return null;
  }
  return session;
}
