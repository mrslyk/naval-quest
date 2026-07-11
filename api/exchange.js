/**
 * Convert NAV → BTC for cashout (Slyk live rate).
 */
import { requireSession } from './lib/session.js';
import { readBody } from './lib/http.js';
import { CASHOUT_TARGETS } from './lib/economy.js';
import {
  slykPost,
  slykGet,
  getWalletBalances,
  balanceOf,
  rewardAssetCode,
  rewardAssetSymbol,
} from './lib/slyk.js';
import { savePlayerProgress } from './lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = requireSession(req, res);
  if (!session) return;

  const { amount } = await readBody(req);
  const target = CASHOUT_TARGETS[0];
  const targetAsset = target.assetCode;

  const reward = rewardAssetCode();
  const balances = await getWalletBalances(session.primaryWalletId);
  const nav = Number(balanceOf(balances, reward));
  const spend = amount != null ? Number(amount) : nav;

  if (!spend || spend <= 0) {
    return res.status(400).json({ error: `No ${rewardAssetSymbol()} to convert` });
  }
  if (spend > nav) {
    return res.status(402).json({ error: `Only ${nav} ${rewardAssetSymbol()} available` });
  }

  try {
    const rate = await slykGet(`/rates/${reward}/${targetAsset}`);
    const quoteAmount = (spend * Number(rate.rate)).toFixed(8);

    const tx = await slykPost('/transactions/exchange', {
      baseAmount: String(spend),
      baseAssetCode: reward,
      quoteAssetCode: targetAsset,
      rate: rate.rate,
      walletId: session.primaryWalletId,
      code: 'order',
      customData: { game: 'naval-quest', action: 'cashout-convert' },
    });

    if (tx.status === 'pending' || tx.status === 'processing') {
      try {
        if (tx.status === 'pending') await slykPost(`/transactions/${tx.id}/approve`, {});
        await slykPost(`/transactions/${tx.id}/confirm`, {});
      } catch {
        /* may auto-settle */
      }
    }

    try {
      await savePlayerProgress(session.userId, {
        displayName: session.name,
        btcDelta: Number(quoteAmount),
      });
    } catch {
      /* stats best-effort */
    }

    const next = await getWalletBalances(session.primaryWalletId);
    return res.status(200).json({
      ok: true,
      converted: spend,
      received: quoteAmount,
      receivedLabel: `${quoteAmount} ${targetAsset.toUpperCase()}`,
      rate: rate.rate,
      transactionId: tx.id,
      balances: next,
      nav: balanceOf(next, reward),
    });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || String(err) });
  }
}
