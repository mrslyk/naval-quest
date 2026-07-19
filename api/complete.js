/**
 * Award NAV when a level is cleared (Slyk automatic task).
 */
import { getPayspaceSnapshot } from './lib/payspace.js';
import { resolveLevelTaskId, rewardLabelForLevel } from './lib/levels.js';
import { getSlykConfig, slykPost } from './lib/slyk.js';
import { readSession } from './lib/session.js';
import { rewardAmountForLevel, rewardLabelForLevelNum } from './lib/economy.js';
import { readBody } from './lib/http.js';
import { savePlayerProgress } from './lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { apiKey } = getSlykConfig();
  if (!apiKey) {
    return res.status(503).json({ error: 'SLYK_API_KEY not configured' });
  }

  const body = await readBody(req);
  const session = readSession(req);
  const userId = body.userId || session?.userId;
  const levelNum = Number(body.level);
  const slug = body.slug || 'naval';

  if (!userId) {
    return res.status(401).json({
      error: 'Sign in to earn NAV',
      hint: 'Create an account in Naval Quest to receive rewards.',
    });
  }

  if (!levelNum || levelNum < 1) {
    return res.status(400).json({ error: 'level required (1–39)' });
  }

  const snapshot = await getPayspaceSnapshot(slug);
  const levelRewards = {
    byLevel: Object.fromEntries((snapshot.levelRewards?.perLevel ?? []).map((r) => [r.level, r])),
    defaultAmountLabel: snapshot.levelRewards?.defaultAmountLabel,
  };

  let taskId = body.taskId || resolveLevelTaskId(levelRewards, levelNum);

  if (!taskId) {
    // Fallback: find by name pattern from live tasks list
    const match = snapshot.levelRewards?.perLevel?.find((r) => r.level === levelNum);
    taskId = match?.taskId;
  }

  if (!taskId) {
    return res.status(404).json({
      error: 'No reward task for this level',
      level: levelNum,
    });
  }

  // Game schedule is source of truth for UI / stats (Slyk task amount should be synced to match).
  const navAmount = rewardAmountForLevel(levelNum);
  const amountLabel = rewardLabelForLevelNum(levelNum);
  // Keep Slyk mapped label available for debugging
  const slykLabel = rewardLabelForLevel(levelRewards, levelNum);

  try {
    await slykPost(`/tasks/${taskId}/complete`, { userId });

    try {
      await savePlayerProgress(userId, {
        displayName: session?.name,
        levelsCleared: levelNum,
        navDelta: body.alreadyClaimed ? 0 : navAmount,
      });
    } catch {
      /* stats best-effort */
    }

    return res.status(200).json({
      ok: true,
      level: levelNum,
      taskId,
      amountLabel,
      amount: navAmount,
      slykAmountLabel: slykLabel,
      referralNote: 'Your inviter earns a share of this reward automatically.',
    });
  } catch (err) {
    // Already completed is ok for resume play
    const msg = err.message || String(err);
    if (/already|completed|available/i.test(msg)) {
      try {
        await savePlayerProgress(userId, {
          displayName: session?.name,
          levelsCleared: levelNum,
          navDelta: 0,
        });
      } catch {
        /* stats best-effort */
      }
      return res.status(200).json({
        ok: true,
        level: levelNum,
        taskId,
        amountLabel: null,
        message: 'Reward already claimed for this level',
        alreadyClaimed: true,
      });
    }
    return res.status(err.status || 500).json({ error: msg, level: levelNum, taskId });
  }
}
