/**
 * Public game stats — sponsorship total, NAV won, BTC won, leaderboard.
 */
import { readGlobalStats, listLeaderboard } from './lib/store.js';
import { formatUsd } from './lib/stripe.js';
import { rewardAssetSymbol } from './lib/slyk.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const global = await readGlobalStats();
    const leaderboard = await listLeaderboard(25);
    const symbol = rewardAssetSymbol();

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

    return res.status(200).json({
      sponsorshipTotalCents: global.sponsorshipCents || 0,
      sponsorshipTotalLabel: formatUsd(global.sponsorshipCents || 0),
      navWonTotal: global.navWonTotal || 0,
      navWonLabel: `${Number(global.navWonTotal || 0).toLocaleString()} ${symbol}`,
      btcWonTotal: global.btcWonTotal || 0,
      btcWonLabel: `${Number(global.btcWonTotal || 0).toFixed(8)} BTC`,
      leaderboard: leaderboard.map((p, i) => ({
        rank: i + 1,
        displayName: p.displayName || 'Player',
        levelsCleared: p.levelsCleared || 0,
        navWon: p.navWon || 0,
        btcWon: p.btcWon || 0,
      })),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}
