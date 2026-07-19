/**
 * Roll a random Naval AI bonus question after a level clear.
 * Appears roughly every 3–4 levels, unpredictably.
 */
import { requireSession } from './lib/session.js';
import { readBody } from './lib/http.js';
import { kimiChat, parseJsonFromModel, kimiConfig } from './lib/kimi.js';
import { rewardAmountForLevel, rewardLabelForLevelNum } from './lib/economy.js';
import { blobStore } from './lib/store.js';

function shouldOffer(levelsCleared) {
  const hitMilestone = levelsCleared > 0 && (levelsCleared % 3 === 0 || levelsCleared % 4 === 0);
  if (!hitMilestone) return false;
  return Math.random() < 0.55;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = requireSession(req, res);
  if (!session) return;

  const { apiKey } = kimiConfig();
  if (!apiKey) {
    return res.status(200).json({ offer: false, reason: 'kimi_not_configured' });
  }

  const body = await readBody(req);
  const level = Number(body.level);
  const tweet = String(body.tweet || '').trim();
  const title = String(body.title || '').trim().slice(0, 120);
  const navalIntro = String(body.navalIntro || '').trim().slice(0, 500);

  if (!level || level < 1) return res.status(400).json({ error: 'level required' });
  if (tweet.length < 20) return res.status(400).json({ error: 'tweet required' });

  const store = await blobStore();
  const offeredKey = `bonus-offered:${session.userId}:${level}`;
  const already = await store.get(offeredKey, { type: 'json' });
  if (already) {
    return res.status(200).json({ offer: false, reason: 'already_offered' });
  }

  if (!shouldOffer(level)) {
    return res.status(200).json({ offer: false, reason: 'skip' });
  }

  const bonusAmount = rewardAmountForLevel(level);
  const bonusLabel = rewardLabelForLevelNum(level);

  try {
    const { text } = await kimiChat({
      system: `You are Naval Ravikant inside the Naval Quest game. Generate ONE short open-ended question that tests whether the player understood THIS tweet's lesson. The player must answer in their own words — not quote the tweet.
Return ONLY valid JSON: {"question":"...","hint":"one short nudge"}
No markdown.`,
      user: `Tweet #${level} title: ${title || 'Naval'}
Tweet: ${tweet}
Context: ${navalIntro || 'How to Get Rich'}`,
      temperature: 0.7,
      json: true,
    });

    const parsed = parseJsonFromModel(text);
    const question = String(parsed?.question || '').trim();
    if (!question || question.length < 12) {
      return res.status(200).json({ offer: false, reason: 'bad_question' });
    }

    const questionId = `bq_${session.userId}_${level}_${Date.now()}`;
    await store.setJSON(`bonus-q:${questionId}`, {
      questionId,
      userId: session.userId,
      level,
      question,
      hint: String(parsed?.hint || '').slice(0, 200),
      tweet,
      title,
      bonusAmount,
      createdAt: Date.now(),
      status: 'open',
    });
    await store.setJSON(offeredKey, { questionId, at: Date.now() });

    return res.status(200).json({
      offer: true,
      questionId,
      question,
      hint: parsed?.hint || null,
      level,
      bonusAmount,
      bonusLabel,
      navalLine: 'Naval appears.',
    });
  } catch (err) {
    console.error('[bonus-roll]', err.message);
    return res.status(200).json({ offer: false, reason: 'kimi_error', error: err.message });
  }
}
