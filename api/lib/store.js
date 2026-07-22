/**
 * Server-side persistence — Netlify Blobs in production, in-memory fallback for local dev.
 */
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'naval-quest';

let memorySingleton = null;

function memoryStore() {
  if (memorySingleton) return memorySingleton;
  const data = new Map();
  memorySingleton = {
    async get(key, opts = {}) {
      const raw = data.get(key);
      if (raw == null) return null;
      if (opts.type === 'json') {
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      }
      return raw;
    },
    async set(key, value) {
      data.set(key, typeof value === 'string' ? value : String(value));
    },
    async setJSON(key, obj) {
      data.set(key, JSON.stringify(obj));
    },
    async list({ prefix = '' } = {}) {
      const blobs = [...data.keys()]
        .filter((k) => k.startsWith(prefix))
        .map((key) => ({ key }));
      return { blobs };
    },
  };
  return memorySingleton;
}

function hasNetlifyBlobsContext() {
  return Boolean(
    process.env.NETLIFY ||
      process.env.NETLIFY_BLOBS_CONTEXT ||
      process.env.BLOBS_TOKEN ||
      (process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN)
  );
}

export async function blobStore() {
  if (!hasNetlifyBlobsContext()) {
    return memoryStore();
  }

  try {
    const opts = { name: STORE_NAME, consistency: 'strong' };
    if (process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN) {
      opts.siteID = process.env.NETLIFY_SITE_ID;
      opts.token = process.env.NETLIFY_AUTH_TOKEN;
    }
    return getStore(opts);
  } catch {
    return memoryStore();
  }
}

export async function readGlobalStats() {
  const store = await blobStore();
  return (
    (await store.get('stats:global', { type: 'json' })) || {
      sponsorshipCents: 0,
      navWonTotal: 0,
      btcWonTotal: 0,
    }
  );
}

export async function writeGlobalStats(stats) {
  const store = await blobStore();
  await store.setJSON('stats:global', stats);
}

export async function readPlayer(userId) {
  const store = await blobStore();
  return (await store.get(`player:${userId}`, { type: 'json' })) || null;
}

export async function savePlayerProgress(userId, patch) {
  const store = await blobStore();
  const key = `player:${userId}`;
  const existing = (await store.get(key, { type: 'json' })) || { userId, levelsCleared: 0, navWon: 0, btcWon: 0 };

  const next = {
    ...existing,
    userId,
    displayName: patch.displayName ?? existing.displayName ?? 'Player',
    levelsCleared: Math.max(
      Number(existing.levelsCleared) || 0,
      Number(patch.levelsCleared) || 0
    ),
    navWon: Number(existing.navWon || 0) + (Number(patch.navDelta) || 0),
    btcWon: Number(existing.btcWon || 0) + (Number(patch.btcDelta) || 0),
    updatedAt: Date.now(),
  };

  await store.setJSON(key, next);

  const index = (await store.get('leaderboard:index', { type: 'json' })) || [];
  if (!index.includes(userId)) {
    index.push(userId);
    await store.setJSON('leaderboard:index', index);
  }

  const globalStats = await readGlobalStats();
  if (patch.navDelta) globalStats.navWonTotal = Number(globalStats.navWonTotal || 0) + Number(patch.navDelta);
  if (patch.btcDelta) globalStats.btcWonTotal = Number(globalStats.btcWonTotal || 0) + Number(patch.btcDelta);
  await writeGlobalStats(globalStats);

  return next;
}

export async function recordSponsorship({ amountCents, sponsorName, sponsorMessage, stripeSessionId }) {
  const store = await blobStore();
  const id = stripeSessionId || `sp_${Date.now()}`;
  await store.setJSON(`sponsorship:${id}`, {
    amountCents,
    sponsorName: sponsorName || 'Anonymous',
    sponsorMessage: sponsorMessage || '',
    stripeSessionId: id,
    createdAt: Date.now(),
  });

  const globalStats = await readGlobalStats();
  globalStats.sponsorshipCents = Number(globalStats.sponsorshipCents || 0) + Number(amountCents);
  await writeGlobalStats(globalStats);
  return globalStats;
}

export async function listLeaderboard(limit = 50) {
  const store = await blobStore();
  const index = (await store.get('leaderboard:index', { type: 'json' })) || [];
  const players = [];

  for (const userId of index) {
    const row = await store.get(`player:${userId}`, { type: 'json' });
    if (row) players.push(row);
  }

  players.sort((a, b) => {
    const ld = (Number(b.levelsCleared) || 0) - (Number(a.levelsCleared) || 0);
    if (ld !== 0) return ld;
    return (Number(b.navWon) || 0) - (Number(a.navWon) || 0);
  });

  return players.slice(0, limit);
}
