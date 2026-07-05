import { readSession } from '../lib/session.js';
import {
  getWalletBalances,
  rewardAssetCode,
  rewardAssetSymbol,
  balanceOf,
} from '../lib/slyk.js';
import { economyMeta } from '../lib/economy.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const session = readSession(req);
  if (!session?.userId) {
    return res.status(200).json({ user: null, economy: economyMeta() });
  }

  try {
    const balances = session.primaryWalletId
      ? await getWalletBalances(session.primaryWalletId)
      : [];

    const reward = rewardAssetCode();
    return res.status(200).json({
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
        referralCode: session.referralCode,
        primaryWalletId: session.primaryWalletId,
      },
      balances: balances.map((b) => ({
        assetCode: b.assetCode,
        amount: b.amount,
        label:
          b.assetCode === reward
            ? `${Number(b.amount)} ${rewardAssetSymbol()}`
            : `${b.amount} ${b.assetCode.toUpperCase()}`,
      })),
      nav: balanceOf(balances, reward),
      navLabel: `${Number(balanceOf(balances, reward))} ${rewardAssetSymbol()}`,
      economy: economyMeta(),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}
