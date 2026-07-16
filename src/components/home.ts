import { TOTAL_LEVELS } from '../data/tweets';
import { escapeHtml } from '../utils';
import { renderSlykDock } from './ui';
import { renderTopNav } from './nav';
import { renderWalletBar } from './wallet-bar';
import { renderGamePreview } from './game-preview';
import { renderHowFlowAnimation } from './how-flow';
import { renderLevelsGrid } from './levels-grid';
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
  const resumeLabel = saved > 0 ? `Continue` : `Play`;

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return `
    <div class="screen screen--home screen--wordle">
      ${renderTopNav('home')}
      ${renderWalletBar(me)}

      <main class="wq-home">
        <header class="wq-hero">
          <h1 class="wq-logo">Naval Quest</h1>
          <p class="wq-tagline">
            Get rich without getting lucky — ${TOTAL_LEVELS} levels from Naval’s tweetstorm.
            Earn ${escapeHtml(symbol)}. Cash out in BTC.
          </p>
          ${renderGamePreview({ saved, perLevel, resumeLabel })}
          ${loading ? '<p class="home-loading">Loading wallet…</p>' : ''}
          <div class="wq-meta">
            <p class="wq-date">${escapeHtml(today)}</p>
            <p class="wq-edition">No. ${saved + 1} · ${TOTAL_LEVELS} tweets</p>
          </div>
          <div class="wq-secondary-actions">
            <button class="wq-btn-outline" id="btn-sponsor-hero" type="button">Sponsor</button>
            <button class="wq-btn-ghost" id="btn-videos-home" type="button">Videos</button>
            <button class="wq-btn-ghost" id="btn-cashout-home" type="button">Cash out</button>
            ${saved > 0 ? '<button class="wq-btn-ghost" id="btn-reset" type="button">Start over</button>' : ''}
          </div>
        </header>

        ${renderLevelsGrid({ saved, perLevel })}

        <div class="wq-home-footer">
          ${renderHowFlowAnimation(symbol)}
          ${sponsorThanks}
          <div class="wq-stats">${statsHtml}</div>
        </div>

        <button class="wq-play wq-play--secondary" id="btn-start-2" type="button" hidden aria-hidden="true">${escapeHtml(resumeLabel)}</button>
        <button class="wq-btn-outline" id="btn-sponsor-home" type="button" hidden aria-hidden="true">Sponsor</button>
      </main>
      ${renderSlykDock()}
    </div>
  `;
}
