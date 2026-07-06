import { TOTAL_LEVELS } from '../data/tweets';
import { escapeHtml } from '../utils';
import { renderSlykDock } from './ui';
import { renderTopNav } from './nav';
import { renderWalletBar } from './wallet-bar';
import { renderMediaHub } from './media-hub';
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
}): string {
  const { saved, me, loading } = opts;
  const symbol = me?.economy?.rewardSymbol ?? 'NAV';
  const perLevel = me?.economy?.levelReward
    ? `${me.economy.levelReward} ${symbol}`
    : `10 ${symbol}`;
  const resumeLabel = saved > 0 ? `Resume · level ${saved + 1}` : 'Start the quest';

  return `
    <div class="screen screen--home">
      ${renderTopNav('home')}
      ${renderWalletBar(me)}

      <div class="landing">
        <header class="landing-hero">
          <p class="kicker">How to get rich · without getting lucky</p>
          <h1 class="display landing-title">Naval Quest</h1>
          <p class="lede landing-lede">
            Play through all ${TOTAL_LEVELS} tweets from Naval Ravikant’s legendary thread.
            Watch the podcast. Earn ${escapeHtml(symbol)}. Cash out when you finish.
          </p>
          <div class="landing-cta">
            <button class="btn-primary btn-primary--lg" id="btn-start" type="button">${escapeHtml(resumeLabel)}</button>
            <button class="btn-secondary" id="btn-how-home" type="button">How it works</button>
          </div>
          ${loading ? '<p class="home-loading">Loading wallet…</p>' : ''}
        </header>

        ${renderMediaHub()}

        <section class="landing-economy" aria-label="Game economy">
          <h2 class="media-section-title">Fund · Play · Earn · Cash out</h2>
          <p class="media-section-lede">A real NAV wallet on Slyk — not just points on a leaderboard.</p>
          <ol class="flywheel-steps flywheel-steps--landing">
            <li class="flywheel-step">
              <span class="flywheel-icon">①</span>
              <div><strong>Add funds</strong><p>Stripe, PayPal, or Coinbase support the reward pool.</p></div>
            </li>
            <li class="flywheel-step">
              <span class="flywheel-icon">②</span>
              <div><strong>Earn ${escapeHtml(symbol)}</strong><p>${escapeHtml(perLevel)} per level cleared via Slyk tasks.</p></div>
            </li>
            <li class="flywheel-step">
              <span class="flywheel-icon">③</span>
              <div><strong>Spend in-game</strong><p>Hints, reveals, and skips cost ${escapeHtml(symbol)}.</p></div>
            </li>
            <li class="flywheel-step">
              <span class="flywheel-icon">④</span>
              <div><strong>Cash out</strong><p>Convert to USD / USDC / BTC after level ${TOTAL_LEVELS}.</p></div>
            </li>
          </ol>
          <div class="landing-economy-actions">
            <button class="btn-secondary" id="btn-fund-home" type="button">Add funds</button>
            <button class="btn-text" id="btn-cashout-home" type="button">Cash out</button>
            ${saved > 0 ? '<button class="btn-text" id="btn-reset" type="button">Start over</button>' : ''}
          </div>
        </section>
      </div>
      ${renderSlykDock()}
    </div>
  `;
}
