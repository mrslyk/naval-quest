import { TOTAL_LEVELS } from '../data/tweets';
import { escapeHtml } from '../utils';
import { renderSlykDock } from './ui';
import { renderTopNav } from './nav';
import { renderWalletBar } from './wallet-bar';
import { renderGamePreview } from './game-preview';
import { renderHowFlowAnimation } from './how-flow';
import { LevelRewardResult } from '../slyk/bridge';
import { MeResponse } from '../slyk/session';

export function renderLevelRewardBlock(reward: LevelRewardResult): string {
  if (reward.state === 'sent' && reward.amountLabel) {
    return `
      <div class="reward-banner reward-banner--ok">
        <p class="reward-banner-amount">+${escapeHtml(reward.amountLabel)}</p>
        <p class="reward-banner-text">Added to your wallet</p>
      </div>
    `;
  }
  if (reward.state === 'sent') {
    return `<div class="reward-banner reward-banner--ok"><p class="reward-banner-text">${escapeHtml(reward.message ?? 'Reward sent')}</p></div>`;
  }
  if (reward.state === 'needs_account') {
    return `
      <div class="reward-banner reward-banner--hint">
        <p class="reward-banner-text">${escapeHtml(reward.message ?? '')}</p>
        <button type="button" class="btn-text btn-text--link" id="btn-auth-signup">Sign up to earn →</button>
      </div>
    `;
  }
  if (reward.state === 'error' && reward.message) {
    return `<div class="reward-banner reward-banner--err"><p class="reward-banner-text">${escapeHtml(reward.message)}</p></div>`;
  }
  return '';
}

export function renderShopStrip(me: MeResponse | null): string {
  const items = me?.economy?.shop ?? [];
  if (!items.length) return '';
  return `
    <div class="shop-strip" aria-label="Spend NAV">
      ${items
        .map(
          (item) => `
        <button type="button" class="shop-chip" data-shop="${escapeHtml(item.id)}" title="${escapeHtml(item.description)}">
          <span>${escapeHtml(item.name)}</span>
          <span class="shop-chip-price">${escapeHtml(item.priceLabel)}</span>
        </button>`
        )
        .join('')}
    </div>
  `;
}

export function renderHomeScreen(opts: {
  saved: number;
  me: MeResponse | null;
  loading: boolean;
  statsHtml?: string;
  sponsorThanks?: string;
}): string {
  const { saved, me, loading, statsHtml = '', sponsorThanks = '' } = opts;
  const symbol = me?.economy?.rewardSymbol ?? 'NAV';
  const perLevel = me?.economy?.levelReward
    ? `${me.economy.levelReward} ${symbol}`
    : `10 ${symbol}`;
  const resumeLabel = saved > 0 ? `Resume level ${saved + 1}` : 'Start playing';

  const pathChips = Array.from({ length: TOTAL_LEVELS }, (_, i) => {
    const n = i + 1;
    const cls = i < saved ? 'path-chip path-chip--done' : i === saved ? 'path-chip path-chip--now' : 'path-chip';
    return `<span class="${cls}">${i < saved ? '✓' : n}</span>`;
  }).join('');

  return `
    <div class="screen screen--home">
      ${renderTopNav('home')}
      ${renderWalletBar(me)}

      <div class="landing landing--bright">
        <header class="home-hero">
          <div class="home-hero-copy">
            <p class="home-hero-kicker">Play · Learn · Earn</p>
            <h1 class="home-hero-title">Naval’s tweetstorm,<br />turned into a game.</h1>
            <p class="home-hero-lede">
              ${TOTAL_LEVELS} interactive levels through <em>How to Get Rich</em>.
              Clear puzzles, earn <strong>${escapeHtml(symbol)}</strong>, cash out in BTC.
            </p>
            <div class="home-hero-actions">
              <button class="btn-secondary" id="btn-sponsor-hero" type="button">Sponsor</button>
              <button class="btn-ghost" id="btn-videos-home" type="button">Watch Naval →</button>
            </div>
            ${loading ? '<p class="home-loading">Loading wallet…</p>' : ''}
          </div>
          ${renderGamePreview({ saved, perLevel, resumeLabel })}
        </header>

        ${renderHowFlowAnimation(symbol)}

        <section class="home-stats-wrap">
          ${sponsorThanks}
          ${statsHtml}
        </section>

        <section class="home-path" aria-label="Quest progress">
          <h2 class="section-title">The ${TOTAL_LEVELS}-level path</h2>
          <p class="section-lede">One tweet per level — from “Seek wealth” to “Productize yourself.”</p>
          <div class="path-grid">${pathChips}</div>
        </section>

        <section class="home-sponsor-strip">
          <div class="home-sponsor-copy">
            <h2 class="section-title">Fund the prize pool</h2>
            <p class="section-lede">Patrons sponsor via Stripe. Players earn ${escapeHtml(symbol)} as they learn.</p>
          </div>
          <div class="home-sponsor-actions">
            <button class="btn-primary" id="btn-sponsor-home" type="button">Sponsor Naval Quest</button>
            <button class="btn-text" id="btn-cashout-home" type="button">Cash out</button>
            ${saved > 0 ? '<button class="btn-text" id="btn-reset" type="button">Start over</button>' : ''}
          </div>
        </section>

        <section class="home-final">
          <h2 class="home-final-title">Wealth is assets that earn while you sleep.</h2>
          <button class="btn-primary btn-primary--xl" id="btn-start-2" type="button">${escapeHtml(resumeLabel)} →</button>
        </section>
      </div>
      ${renderSlykDock()}
    </div>
  `;
}
