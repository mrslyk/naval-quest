import { TweetLevel } from '../data/tweets';
import { escapeHtml } from '../utils';
import { dashboardUrl } from '../slyk/config';

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
      <span class="whisper-text">${escapeHtml(messages[phase])}</span>
    </p>
  `;
}

export function renderTweetCard(level: TweetLevel, total: number): string {
  return `
    <blockquote class="tweet">
      <footer class="tweet-meta">
        <span class="tweet-index">${String(level.id).padStart(2, '0')}</span>
        <span class="tweet-of">of ${total}</span>
      </footer>
      <p class="tweet-body">${escapeHtml(level.tweet)}</p>
    </blockquote>
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
