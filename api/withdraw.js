/**
 * Withdraw fiat/crypto after conversion.
 * Prefers widget withdrawal (user JWT); falls back to API-key withdrawal.
 */
import { requireSession } from './lib/session.js';
import { readBody } from './lib/http.js';
import { CASHOUT_TARGETS } from './lib/economy.js';
import {
  slykPost,
  widgetPost,
  getWalletBalances,
  balanceOf,
} from './lib/slyk.js';
import { loadProgress } from './lib/progress.js';

const TOTAL_LEVELS = 39;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = requireSession(req, res);
  if (!session) return;

  const body = await readBody(req);
  const { assetCode, amount, destination, force } = body;

  const target = CASHOUT_TARGETS.find((t) => t.assetCode === assetCode) || CASHOUT_TARGETS[0];
  if (assetCode && assetCode !== 'btc') {
    return res.status(400).json({ error: 'Withdrawals are BTC-only via Coinbase on Slyk' });
  }
  if (!destination?.trim()) {
    return res.status(400).json({
      error: 'BTC wallet address required for Coinbase withdrawal',
    });
  }

  // Game rule: finish all levels before cashout (unless force for testing).
  if (!force) {
    const progress = loadProgress(req);
    if (progress < TOTAL_LEVELS) {
      return res.status(403).json({
        error: `Complete all ${TOTAL_LEVELS} levels before withdrawing (progress: ${progress}).`,
        progress,
        required: TOTAL_LEVELS,
      });
    }
  }

  const balances = await getWalletBalances(session.primaryWalletId);
  const available = Number(balanceOf(balances, target.assetCode));
  const withdrawAmount = amount != null ? Number(amount) : available;

  if (!withdrawAmount || withdrawAmount <= 0) {
    return res.status(400).json({
      error: `No ${target.assetCode.toUpperCase()} balance. Convert NAV first.`,
    });
  }
  if (withdrawAmount > available) {
    return res.status(402).json({ error: `Only ${available} ${target.assetCode.toUpperCase()} available` });
  }

  const payload = {
    amount: String(withdrawAmount),
    assetCode: target.assetCode,
    code: target.withdrawCode,
    data: { withdrawalDestination: destination.trim() },
  };

  try {
    let tx;
    try {
      tx = await widgetPost('/widget/withdrawal', payload, session.token);
    } catch {
      tx = await slykPost('/transactions/withdrawal', {
        ...payload,
        originWalletId: session.primaryWalletId,
      });
    }

    return res.status(200).json({
      ok: true,
      status: tx.status || 'pending',
      amount: withdrawAmount,
      assetCode: target.assetCode,
      rail: target.rail,
      message: `Withdrawal submitted via ${target.rail}. Status: ${tx.status || 'pending'}.`,
      transactionId: tx.id,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || String(err) });
  }
}
