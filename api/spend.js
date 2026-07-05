/**
 * Spend NAV on in-game help (hint / reveal / skip).
 * Transfers NAV from player wallet → master wallet.
 */
import { requireSession } from './lib/session.js';
import { readBody } from './lib/http.js';
import { SHOP_ITEMS } from './lib/economy.js';
import {
  slykPost,
  getMasterWalletId,
  getWalletBalances,
  balanceOf,
  rewardAssetCode,
  rewardAssetSymbol,
} from './lib/slyk.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = requireSession(req, res);
  if (!session) return;

  const { itemId, level } = await readBody(req);
  const item = SHOP_ITEMS[itemId];
  if (!item) return res.status(400).json({ error: 'Unknown shop item' });

  const asset = rewardAssetCode();
  const balances = await getWalletBalances(session.primaryWalletId);
  const nav = Number(balanceOf(balances, asset));
  if (nav < item.price) {
    return res.status(402).json({
      error: `Need ${item.price} ${rewardAssetSymbol()}, you have ${nav}`,
    });
  }

  const masterWalletId = await getMasterWalletId();
  if (!masterWalletId) {
    return res.status(503).json({ error: 'Master wallet not configured' });
  }

  try {
    const tx = await slykPost('/transactions/transfer', {
      amount: String(item.price),
      assetCode: asset,
      code: 'internal',
      originWalletId: session.primaryWalletId,
      destinationWalletId: masterWalletId,
      customData: {
        game: 'naval-quest',
        item: item.id,
        level: level ?? null,
      },
      description: `Naval Quest ${item.name}`,
    });

    // Internal transfers often land pending — settle immediately for in-game spend.
    if (tx.status === 'pending' || tx.status === 'processing') {
      try {
        if (tx.status === 'pending') await slykPost(`/transactions/${tx.id}/approve`, {});
        await slykPost(`/transactions/${tx.id}/confirm`, {});
      } catch {
        /* balance may already reflect processing */
      }
    }

    const nextBalances = await getWalletBalances(session.primaryWalletId);
    return res.status(200).json({
      ok: true,
      item: item.id,
      effect: item.effect,
      spent: item.price,
      spentLabel: `${item.price} ${rewardAssetSymbol()}`,
      nav: balanceOf(nextBalances, asset),
      navLabel: `${Number(balanceOf(nextBalances, asset))} ${rewardAssetSymbol()}`,
      transactionId: tx.id,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || String(err) });
  }
}
