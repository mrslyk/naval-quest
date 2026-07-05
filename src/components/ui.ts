import { TweetLevel } from '../data/tweets';
import { escapeHtml } from '../utils';
import { dashboardUrl } from '../slyk/config';
import { renderPodcastPlayer } from './podcast-player';

export function renderSlykDock(opts: { highlight?: boolean } = {}): string {
  const url = dashboardUrl();
  const cls = opts.highlight ? 'slyk-dock slyk-dock--highlight' : 'slyk-dock';
  return `
    <footer class="${cls}">
      <a class="slyk-dock-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
        <span class="slyk-dock-brand">Slyk</span>
        <span class="slyk-dock-sep">·</span>
        <span>Dashboard & rewards</span>
      </a>
    </footer>
  `;
}

export function renderNavalGuide(level: TweetLevel, phase: 'intro' | 'playing' | 'success'): string {
  const messages = {
    intro: level.navalIntro,
    playing: level.navalHint,
    success: level.navalSuccess,
  };

  return `
    <p class="whisper whisper--${phase}" role="note">
      <span class="whisper-label">${phase === 'success' ? 'Naval' : phase === 'intro' ? 'Before you play' : 'Hint'}</span>
      <span class="whisper-text">${escapeHtml(messages[phase])}</span>
    </p>
  `;
}

export function renderTweetCard(level: TweetLevel, total: number): string {
  const tweetUrl = `https://twitter.com/naval/status/1002103360646823936`;

  return `
    <article class="tweet-feature" aria-labelledby="tweet-heading-${level.id}">
      <header class="tweet-feature-head">
        <div class="tweet-author">
          <span class="tweet-avatar" aria-hidden="true">N</span>
          <div class="tweet-author-meta">
            <span class="tweet-author-name">Naval Ravikant</span>
            <span class="tweet-author-handle">@naval</span>
          </div>
        </div>
        <div class="tweet-source">
          <span class="tweet-index" id="tweet-heading-${level.id}">Tweet ${level.id}</span>
          <span class="tweet-of">of ${total}</span>
          <span class="tweet-storm">How to Get Rich</span>
        </div>
      </header>

      <blockquote class="tweet tweet--featured">
        <p class="tweet-body">${escapeHtml(level.tweet)}</p>
      </blockquote>

      <p class="tweet-attribution">
        From Naval's
        <a href="${escapeHtml(tweetUrl)}" target="_blank" rel="noopener noreferrer">May 2018 tweetstorm</a>
        · expanded in the
        <a href="https://nav.al/rich" target="_blank" rel="noopener noreferrer">podcast with Nivi</a>
      </p>

      ${renderPodcastPlayer(level.id)}
    </article>
  `;
}

export function renderProgressBar(current: number, total: number): string {
  const dots = Array.from({ length: total }, (_, i) => {
    const state = i < current ? 'done' : i === current ? 'now' : '';
    return `<span class="dot ${state}" aria-hidden="true"></span>`;
  }).join('');

  return `
    <div class="progress" role="progressbar" aria-valuenow="${current + 1}" aria-valuemin="1" aria-valuemax="${total}">
      <div class="dots">${dots}</div>
    </div>
  `;
}

export function renderLevelHeader(level: TweetLevel, current: number, total: number): string {
  return `
    <header class="top-bar">
      <button class="btn-text" id="btn-home" type="button" aria-label="Home">←</button>
      <span class="level-name">${escapeHtml(level.title)}</span>
      ${renderProgressBar(current, total)}
    </header>
  `;
}
