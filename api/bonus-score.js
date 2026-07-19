/**
 * Score a Naval AI bonus answer with Kimi and pay NAV = level reward on pass.
 */
import { requireSession } from './lib/session.js';
import { readBody } from './lib/http.js';
import { kimiChat, parseJsonFromModel, kimiConfig } from './lib/kimi.js';
import { rewardAmountForLevel, rewardLabelForLevelNum } from './lib/economy.js';
import {
  slykPost,
  getMasterWalletId,
  getWalletBalances,
  balanceOf,
  rewardAssetCode,
  rewardAssetSymbol,
} from './lib/slyk.js';
import { blobStore, savePlayerProgress } from './lib/store.js';

function overlapRatio(a, b) {
  const norm = (s) =>
    String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  const A = norm(a);
  const B = norm(b);
  if (!A || !B) return 0;
  if (B.includes(A) || A.includes(B)) {
    return Math.min(A.length, B.length) / Math.max(A.length, B.length);
  }
  const aw = new Set(A.split(' ').filter((w) => w.length > 3));
  const bw = B.split(' ').filter((w) => w.length > 3);
  if (!aw.size || !bw.length) return 0;
  let hit = 0;
  for (const w of bw) if (aw.has(w)) hit += 1;
  return hit / Math.max(aw.size, bw.length);
}

async function payBonus(session, amount, level, questionId) {
  const masterWalletId = await getMasterWalletId();
  if (!masterWalletId) {
    const err = new Error('Master wallet not configured for bonus payout');
    err.status = 503;
    throw err;
  }
  const asset = rewardAssetCode();
  const tx = await slykPost('/transactions/transfer', {
    amount: String(amount),
    assetCode: asset,
    code: 'internal',
    originWalletId: masterWalletId,
    destinationWalletId: session.primaryWalletId,
    customData: {
      game: 'naval-quest',
      kind: 'naval-ai-bonus',
      level,
      questionId,
    },
    description: `Naval AI bonus · level ${level}`,
  });

  if (tx.status === 'pending' || tx.status === 'processing') {
    try {
      if (tx.status === 'pending') await slykPost(`/transactions/${tx.id}/approve`, {});
      await slykPost(`/transactions/${tx.id}/confirm`, {});
    } catch {
      /* may already settle */
    }
  }

  return tx;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = requireSession(req, res);
  if (!session) return;
  if (!session.primaryWalletId) {
    return res.status(400).json({ error: 'No wallet on session — sign in again' });
  }

  const { apiKey } = kimiConfig();
  if (!apiKey) return res.status(503).json({ error: 'MOONSHOT_API_KEY not configured' });

  const body = await readBody(req);
  const questionId = String(body.questionId || '');
  const answer = String(body.answer || '').trim();

  if (!questionId) return res.status(400).json({ error: 'questionId required' });
  if (answer.length < 12) {
    return res.status(200).json({
      pass: false,
      score: 0,
      feedback: 'Too short. Say it in your own words — a real sentence.',
      paid: false,
    });
  }
  if (answer.length > 2000) {
    return res.status(400).json({ error: 'Answer too long' });
  }

  const store = await blobStore();
  const q = await store.get(`bonus-q:${questionId}`, { type: 'json' });
  if (!q || q.userId !== session.userId) {
    return res.status(404).json({ error: 'Question not found' });
  }
  if (q.status === 'paid' || q.status === 'failed') {
    return res.status(200).json({
      pass: q.status === 'paid',
      score: q.score ?? 0,
      feedback: q.feedback || 'Already answered.',
      paid: q.status === 'paid',
      bonusLabel: q.status === 'paid' ? `${q.bonusAmount} ${rewardAssetSymbol()}` : null,
    });
  }

  // Hard reject near-copy of the tweet before calling Kimi
  const copyScore = overlapRatio(answer, q.tweet);
  if (copyScore >= 0.72) {
    const feedback = 'That looks like the tweet itself. Explain the idea in your own words.';
    await store.setJSON(`bonus-q:${questionId}`, { ...q, status: 'failed', score: 10, feedback });
    return res.status(200).json({ pass: false, score: 10, feedback, paid: false });
  }

  try {
    const { text } = await kimiChat({
      system: `You are Naval scoring a player's short answer in Naval Quest.
Reject: copy-paste of the tweet, gibberish, unrelated fluff, single words, or regurgitated quotes with no understanding.
Reward: clear paraphrase that shows they grasped the lesson.
Return ONLY JSON:
{"score":0-100,"pass":true|false,"feedback":"1-2 sentences in Naval's calm voice"}
pass requires score >= 70 and genuine understanding.`,
      user: `Tweet: ${q.tweet}
Question: ${q.question}
Player answer: ${answer}
Tweet-overlap heuristic: ${copyScore.toFixed(2)} (1.0 = identical)`,
      temperature: 0.2,
      json: true,
    });

    const parsed = parseJsonFromModel(text) || {};
    let score = Math.max(0, Math.min(100, Number(parsed.score) || 0));
    let pass = Boolean(parsed.pass) && score >= 70;
    let feedback = String(parsed.feedback || '').trim() || (pass ? 'Clear thinking.' : 'Not quite — try again next time.');

    // Safety: never pass on high overlap even if model is lenient
    if (copyScore >= 0.65) {
      pass = false;
      score = Math.min(score, 40);
      feedback = 'Too close to the original wording. Make the idea yours.';
    }

    const amountNum = Number(q.bonusAmount) || rewardAmountForLevel(q.level);
    const amount = String(amountNum);
    let paid = false;
    let bonusLabel = null;
    let navLabel = null;

    if (pass) {
      try {
        await payBonus(session, amount, q.level, questionId);
        paid = true;
        bonusLabel = rewardLabelForLevelNum(q.level);
        const balances = await getWalletBalances(session.primaryWalletId);
        navLabel = `${Number(balanceOf(balances, rewardAssetCode()))} ${rewardAssetSymbol()}`;
        try {
          await savePlayerProgress(session.userId, {
            displayName: session.name,
            levelsCleared: q.level,
            navDelta: Number(amount),
          });
        } catch {
          /* stats best-effort */
        }
      } catch (payErr) {
        console.error('[bonus-score] pay', payErr.message);
        feedback = `${feedback} (Understood — payout pending: ${payErr.message})`;
      }
    }

    await store.setJSON(`bonus-q:${questionId}`, {
      ...q,
      status: paid ? 'paid' : pass ? 'passed_unpaid' : 'failed',
      score,
      feedback,
      answer: answer.slice(0, 2000),
      answeredAt: Date.now(),
    });

    return res.status(200).json({
      pass,
      score,
      feedback,
      paid,
      bonusAmount: pass ? amount : null,
      bonusLabel,
      navLabel,
    });
  } catch (err) {
    console.error('[bonus-score]', err.message);
    return res.status(err.status || 500).json({ error: err.message || String(err) });
  }
}
