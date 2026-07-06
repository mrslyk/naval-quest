import { TOTAL_LEVELS } from '../data/tweets';
import { escapeHtml } from '../utils';
import { renderSlykDock } from './ui';
import { renderTopNav } from './nav';
import { renderWalletBar } from './wallet-bar';
import { renderPodcastPlatforms, renderTopVideosGrid, renderBooksRow } from './media-hub';
import { FEATURED_VIDEO, youtubeWatchUrl } from '../data/media';
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
  const resumeLabel = saved > 0 ? `Resume · Level ${saved + 1}` : 'Play the quest';
  const progressPct = Math.round((saved / TOTAL_LEVELS) * 100);
  const fv = FEATURED_VIDEO;

  const marqueeQuotes = [
    'Seek wealth, not money or status',
    'Play long-term games with long-term people',
    'Learn to sell. Learn to build.',
    'Code and media are permissionless leverage',
    'All the returns in life come from compound interest',
    'Specific knowledge feels like play to you',
    'Escape competition through authenticity',
    'Productize yourself',
  ];
  const marqueeRun = marqueeQuotes
    .map((q) => `<span class="marquee-item">${escapeHtml(q)}</span><span class="marquee-star" aria-hidden="true">✦</span>`)
    .join('');

  const pathChips = Array.from({ length: TOTAL_LEVELS }, (_, i) => {
    const n = i + 1;
    const cls = i < saved ? 'path-chip path-chip--done' : i === saved ? 'path-chip path-chip--now' : 'path-chip';
    return `<span class="${cls}">${i < saved ? '✓' : n}</span>`;
  }).join('');

  return `
    <div class="screen screen--home">
      ${renderTopNav('home')}
      ${renderWalletBar(me)}

      <div class="landing">

        <header class="hero">
          <div class="hero-glow" aria-hidden="true"></div>
          <div class="hero-copy">
            <p class="hero-kicker anim-up" style="--d:0">Slyk × Naval Ravikant</p>
            <h1 class="hero-title anim-up" style="--d:1">Get rich<br /><em class="shimmer">without getting lucky.</em></h1>
            <p class="hero-lede anim-up" style="--d:2">
              Naval’s legendary tweetstorm, turned into a game. ${TOTAL_LEVELS} levels.
              Real podcast clips. Real ${escapeHtml(symbol)} in a real wallet — cash out when you finish.
            </p>
            <div class="hero-cta anim-up" style="--d:3">
              <button class="btn-primary btn-primary--lg btn-glow" id="btn-start" type="button">${escapeHtml(resumeLabel)} →</button>
              <button class="btn-ghost" id="btn-how-home" type="button">How it works</button>
            </div>
            ${
              saved > 0
                ? `<div class="hero-progress anim-up" style="--d:4" role="progressbar" aria-valuenow="${saved}" aria-valuemin="0" aria-valuemax="${TOTAL_LEVELS}">
                    <div class="hero-progress-track"><div class="hero-progress-fill" style="width:${progressPct}%"></div></div>
                    <span class="hero-progress-label">${saved} / ${TOTAL_LEVELS} tweets cleared</span>
                  </div>`
                : ''
            }
            ${loading ? '<p class="home-loading">Loading wallet…</p>' : ''}
          </div>

          <div class="hero-card anim-up" style="--d:2" aria-hidden="false">
            <div class="hero-deck">
              <article class="hero-tweet hero-tweet--ghost hero-tweet--ghost-2" aria-hidden="true"></article>
              <article class="hero-tweet hero-tweet--ghost" aria-hidden="true"></article>
              <article class="hero-tweet">
                <header class="hero-tweet-head">
                  <span class="hero-tweet-avatar">N</span>
                  <div>
                    <span class="hero-tweet-name">Naval Ravikant</span>
                    <span class="hero-tweet-handle">@naval · May 31, 2018</span>
                  </div>
                </header>
                <p class="hero-tweet-body">Seek wealth, not money or status. Wealth is having assets that earn while you sleep.</p>
                <footer class="hero-tweet-foot">
                  <span>Level 1 of ${TOTAL_LEVELS}</span>
                  <span class="hero-tweet-reward">+${escapeHtml(perLevel)}</span>
                </footer>
              </article>
            </div>
            <a class="hero-video" href="${escapeHtml(youtubeWatchUrl(fv.youtubeId))}" target="_blank" rel="noopener noreferrer">
              <img src="https://i.ytimg.com/vi/${escapeHtml(fv.youtubeId)}/hqdefault.jpg" alt="" loading="lazy" />
              <span class="hero-video-play">▶</span>
              <span class="hero-video-label">${escapeHtml(fv.title)} · ${escapeHtml(fv.duration)}</span>
            </a>
          </div>
        </header>

        <div class="marquee" aria-hidden="true">
          <div class="marquee-track">${marqueeRun}${marqueeRun}</div>
        </div>

        <section class="stat-strip" aria-label="Quest at a glance">
          <div class="qstat"><span class="qstat-num">${TOTAL_LEVELS}</span><span class="qstat-label">tweets, ${TOTAL_LEVELS} levels</span></div>
          <div class="qstat"><span class="qstat-num">3h 36m</span><span class="qstat-label">of Naval, chaptered per level</span></div>
          <div class="qstat"><span class="qstat-num">${escapeHtml(perLevel)}</span><span class="qstat-label">earned per level cleared</span></div>
          <div class="qstat"><span class="qstat-num">$ · ₿</span><span class="qstat-label">cash out to fiat or crypto</span></div>
        </section>

        <section class="quest-path" aria-label="The 39-level path">
          <h2 class="media-section-title">One tweet. One level. ${TOTAL_LEVELS} steps to the top.</h2>
          <p class="media-section-lede">Every level unlocks the next tweet in the thread — with Naval’s own words guiding you through.</p>
          <div class="path-grid">${pathChips}</div>
        </section>

        ${renderTopVideosGrid({ limit: 6 })}
        ${renderPodcastPlatforms()}

        <section class="landing-economy" aria-label="Game economy">
          <h2 class="media-section-title">Fund · Play · Earn · Cash out</h2>
          <p class="media-section-lede">A real ${escapeHtml(symbol)} wallet on Slyk — not points on a leaderboard.</p>
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

        ${renderBooksRow()}

        <section class="landing-final">
          <h2 class="landing-final-title">Wealth is assets that earn<br /><em>while you sleep.</em></h2>
          <button class="btn-primary btn-primary--lg" id="btn-start-2" type="button">${escapeHtml(resumeLabel)} →</button>
        </section>
      </div>
      ${renderSlykDock()}
    </div>
  `;
}
