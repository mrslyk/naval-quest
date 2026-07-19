/**
 * Server-side player progress for leaderboard (requires auth).
 */
import { readSession, requireSession } from './lib/session.js';
import { readBody } from './lib/http.js';
import { readPlayer, savePlayerProgress } from './lib/store.js';
import { loadProgress } from './lib/progress.js';
import { rewardAmountForLevel } from './lib/economy.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const session = readSession(req);
    const cookieLevel = loadProgress(req);

    if (!session?.userId) {
      return res.status(200).json({
        signedIn: false,
        levelsCleared: cookieLevel,
        server: null,
      });
    }

    const server = await readPlayer(session.userId);
    const levelsCleared = Math.max(cookieLevel, server?.levelsCleared || 0);

    return res.status(200).json({
      signedIn: true,
      userId: session.userId,
      displayName: server?.displayName || session.name || 'Player',
      levelsCleared,
      navWon: server?.navWon || 0,
      btcWon: server?.btcWon || 0,
      server,
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = requireSession(req, res);
  if (!session) return;

  const body = await readBody(req);
  const levelsCleared = body.levelsCleared != null ? Number(body.levelsCleared) : null;
  const navDelta = body.navDelta != null ? Number(body.navDelta) : 0;
  const btcDelta = body.btcDelta != null ? Number(body.btcDelta) : 0;

  const patch = {
    displayName: body.displayName || session.name || session.email?.split('@')[0] || 'Player',
    navDelta,
    btcDelta,
  };

  if (levelsCleared != null) patch.levelsCleared = levelsCleared;
  else if (body.level != null) patch.levelsCleared = Number(body.level);

  if (body.recordLevelReward && !body.navDelta) {
    const lvl = Number(body.level || patch.levelsCleared || 1);
    patch.navDelta = rewardAmountForLevel(lvl);
  }

  const saved = await savePlayerProgress(session.userId, patch);

  return res.status(200).json({ ok: true, player: saved });
}
