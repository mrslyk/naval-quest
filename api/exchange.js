/**
 * Convert NAV → USD / USDC / BTC for cashout.
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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = requireSession(req, res);
  if (!session) return;

  const { targetAsset, amount } = await readBody(req);
  const target = CASHOUT_TARGETS.find((t) => t.assetCode === targetAsset);
  if (!target) {
    return res.status(400).json({ error: 'Choose usd, usdc, or btc' });
  }

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
    const rate = await slykGet(`/rates/${reward}/${target.assetCode}`);
    const quoteAmount = (spend * Number(rate.rate)).toFixed(8);

    const tx = await slykPost('/transactions/exchange', {
      baseAmount: String(spend),
      baseAssetCode: reward,
      quoteAssetCode: target.assetCode,
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

    const next = await getWalletBalances(session.primaryWalletId);
    return res.status(200).json({
      ok: true,
      converted: spend,
      received: quoteAmount,
      receivedLabel: `${quoteAmount} ${target.assetCode.toUpperCase()}`,
      rate: rate.rate,
      transactionId: tx.id,
      balances: next,
      nav: balanceOf(next, reward),
    });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || String(err) });
  }
}
