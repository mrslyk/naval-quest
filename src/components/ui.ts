import { TweetLevel } from '../data/tweets';
import { escapeHtml } from '../utils';
import { dashboardUrl } from '../slyk/config';
import { getNavalRichLevel, navAlSectionUrl, NAVAL_RICH_SOURCE_URL } from '../data/naval-rich';
import { renderPodcastPlayer } from './podcast-player';
import { renderLevelMediaStrip } from './media-hub';

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

function renderRichQuotes(levelId: number): string {
  const rich = getNavalRichLevel(levelId);
  if (!rich) return '';

  const blocks: string[] = [];

  if (rich.taglines.length) {
    blocks.push(`
      <div class="rich-taglines" aria-label="Themes from nav.al/rich">
        ${rich.taglines.map((t) => `<p class="rich-tagline">${escapeHtml(t)}</p>`).join('')}
      </div>
    `);
  }

  for (const q of rich.navalQuotes.slice(0, 2)) {
    blocks.push(`
      <blockquote class="rich-quote rich-quote--naval">
        <span class="rich-quote-speaker">Naval</span>
        <p>${escapeHtml(q)}</p>
      </blockquote>
    `);
  }

  for (const q of rich.niviQuotes.slice(0, 1)) {
    blocks.push(`
      <blockquote class="rich-quote rich-quote--nivi">
        <span class="rich-quote-speaker">Nivi</span>
        <p>${escapeHtml(q)}</p>
      </blockquote>
    `);
  }

  if (!blocks.length) return '';

  return `
    <section class="rich-quotes" aria-label="Quotes from the How to Get Rich podcast">
      <div class="rich-quotes-head">
        <span class="rich-quotes-label">From the podcast</span>
        <a class="rich-quotes-link" href="${escapeHtml(navAlSectionUrl(levelId))}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(rich.sectionTitle)} →
        </a>
      </div>
      ${blocks.join('')}
    </section>
  `;
}

export function renderTweetCard(level: TweetLevel, total: number): string {
  const rich = getNavalRichLevel(level.id);
  const tweet = rich?.tweet ?? level.tweet;
  const sectionTitle = rich?.sectionTitle ?? 'How to Get Rich';
  const transcriptUrl = rich ? navAlSectionUrl(level.id) : NAVAL_RICH_SOURCE_URL;
  const tweetUrl = 'https://twitter.com/naval/status/1002103360646823936';

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
        <p class="tweet-body">${escapeHtml(tweet)}</p>
      </blockquote>

      <p class="tweet-attribution">
        Tweet from
        <a href="${escapeHtml(tweetUrl)}" target="_blank" rel="noopener noreferrer">@naval's thread</a>
        · discussed in
        <a href="${escapeHtml(transcriptUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(sectionTitle)}</a>
        on
        <a href="${escapeHtml(NAVAL_RICH_SOURCE_URL)}" target="_blank" rel="noopener noreferrer">nav.al/rich</a>
      </p>

      ${renderRichQuotes(level.id)}
      ${renderPodcastPlayer(level.id)}
      ${renderLevelMediaStrip()}
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
