import { escapeHtml } from '../utils';
import { renderSlykDock } from './ui';
import { renderTopNav } from './nav';
import { GameStats } from '../slyk/session';

export function renderStatsBoard(stats: GameStats | null, loading: boolean): string {
  if (loading) {
    return `<section class="stats-board stats-board--loading" aria-busy="true"><p class="media-section-lede">Loading live stats…</p></section>`;
  }

  const s = stats ?? {
    sponsorshipTotalLabel: '$0',
    navWonLabel: '0 NAV',
    btcWonLabel: '0 BTC',
    leaderboard: [],
  };

  const rows =
    s.leaderboard.length > 0
      ? s.leaderboard
          .map(
            (row) => `
        <tr>
          <td>${row.rank}</td>
          <td>${escapeHtml(row.displayName)}</td>
          <td>${row.levelsCleared} / 39</td>
          <td>${Number(row.navWon).toLocaleString()}</td>
          <td>${Number(row.btcWon).toFixed(8)}</td>
        </tr>`
          )
          .join('')
      : `<tr><td colspan="5" class="stats-empty">Be the first on the board — play the quest.</td></tr>`;

  return `
    <section class="stats-board" aria-labelledby="stats-heading">
      <h2 class="media-section-title" id="stats-heading">Live game stats</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-card-value">${escapeHtml(s.sponsorshipTotalLabel)}</span>
          <span class="stat-card-label">Patron sponsorship</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-value">${escapeHtml(s.navWonLabel)}</span>
          <span class="stat-card-label">NAV won by players</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-value">${escapeHtml(s.btcWonLabel)}</span>
          <span class="stat-card-label">BTC converted &amp; won</span>
        </div>
      </div>
      <h3 class="stats-subtitle">Leaderboard</h3>
      <div class="stats-table-wrap">
        <table class="stats-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>Level</th>
              <th>NAV</th>
              <th>BTC</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>
  `;
}

export function renderSponsorThanks(): string {
  return `
    <div class="reward-banner reward-banner--ok sponsor-thanks">
      <p class="reward-banner-amount">Thank you</p>
      <p class="reward-banner-text">Your sponsorship fuels the Naval Quest prize pool. Players earn NAV as they learn.</p>
    </div>
  `;
}
