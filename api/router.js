/**
 * Shared API router for Vite dev server and optional monolithic handler.
 */
import { makeRes, readBody } from './lib/http.js';

const routes = [
  ['GET', '/api/economy', () => import('./economy.js')],
  ['GET', '/api/auth/me', () => import('./auth/me.js')],
  ['POST', '/api/auth/signup', () => import('./auth/signup.js')],
  ['POST', '/api/auth/login', () => import('./auth/login.js')],
  ['POST', '/api/auth/logout', () => import('./auth/logout.js')],
  ['POST', '/api/complete', () => import('./complete.js')],
  ['POST', '/api/bonus/roll', () => import('./bonus-roll.js')],
  ['POST', '/api/bonus/score', () => import('./bonus-score.js')],
  ['POST', '/api/stripe/checkout', () => import('./stripe-checkout.js')],
  ['GET', '/api/stats', () => import('./stats.js')],
  ['GET', '/api/progress', () => import('./progress.js')],
  ['POST', '/api/progress', () => import('./progress.js')],
  ['POST', '/api/spend', () => import('./spend.js')],
  ['POST', '/api/exchange', () => import('./exchange.js')],
  ['POST', '/api/withdraw', () => import('./withdraw.js')],
  ['GET', '/api/payspace', () => import('./payspace.js')],
  ['GET', '/api/payment-methods', () => import('./payment-methods.js')],
  ['POST', '/api/fund-intent', () => import('./fund-intent.js')],
];

export async function handleApi(req, nodeRes) {
  const url = new URL(req.url || '/', 'http://local');
  const pathname = url.pathname;
  const method = req.method || 'GET';

  const match = routes.find(([m, p]) => m === method && p === pathname);
  if (!match) return false;

  const mod = await match[2]();
  const handler = mod.default;
  const res = makeRes(nodeRes);

  // Attach query for GET handlers that read req.query
  req.query = Object.fromEntries(url.searchParams.entries());

  // Ensure body is available for POST
  if (method !== 'GET' && method !== 'HEAD' && req.body == null) {
    req.body = await readBody(req);
  }

  await handler(req, res);
  return true;
}
