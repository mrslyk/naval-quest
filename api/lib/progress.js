/** Read client progress cookie (set by game) for withdraw gate. */

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

export function loadProgress(req) {
  const cookies = parseCookies(req.headers?.cookie || '');
  const n = Number(cookies.nq_progress || 0);
  return Number.isFinite(n) ? n : 0;
}
