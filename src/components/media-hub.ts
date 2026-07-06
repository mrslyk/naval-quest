import {
  BOOKS,
  FEATURED_VIDEO,
  MediaVideo,
  PODCAST_PLATFORMS,
  TOP_VIDEOS,
  TWEETSTORM_URL,
  youtubeEmbedUrl,
  youtubeWatchUrl,
} from '../data/media';
import { escapeHtml } from '../utils';

function renderVideoCard(video: MediaVideo, compact = false): string {
  const thumb = `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;
  const watch = youtubeWatchUrl(video.youtubeId);
  const cls = compact ? 'media-card media-card--compact' : 'media-card';

  return `
    <article class="${cls}">
      <a class="media-card-thumb" href="${escapeHtml(watch)}" target="_blank" rel="noopener noreferrer" aria-hidden="true" tabindex="-1">
        <img src="${escapeHtml(thumb)}" alt="" loading="lazy" width="480" height="360" />
        <span class="media-card-play" aria-hidden="true">▶</span>
        ${video.tag ? `<span class="media-card-tag">${escapeHtml(video.tag)}</span>` : ''}
      </a>
      <div class="media-card-body">
        <h3 class="media-card-title">
          <a href="${escapeHtml(watch)}" target="_blank" rel="noopener noreferrer">${escapeHtml(video.title)}</a>
        </h3>
        <p class="media-card-meta">${escapeHtml(video.duration)}${video.views ? ` · ${escapeHtml(video.views)} views` : ''}</p>
        ${compact ? '' : `<p class="media-card-desc">${escapeHtml(video.description)}</p>`}
        <button type="button" class="btn-text btn-text--link media-card-embed-btn" data-youtube="${escapeHtml(video.youtubeId)}">
          Watch here →
        </button>
      </div>
    </article>
  `;
}

export function renderFeaturedVideo(): string {
  const v = FEATURED_VIDEO;
  const watch = youtubeWatchUrl(v.youtubeId);

  return `
    <section class="media-featured" aria-labelledby="featured-video-heading">
      <div class="media-featured-copy">
        <p class="media-kicker">Featured</p>
        <h2 class="media-featured-title" id="featured-video-heading">${escapeHtml(v.title)}</h2>
        <p class="media-featured-desc">${escapeHtml(v.description)}</p>
        <p class="media-featured-meta">${escapeHtml(v.duration)}${v.views ? ` · ${escapeHtml(v.views)} views` : ''}</p>
        <div class="media-featured-actions">
          <button type="button" class="btn-secondary" id="btn-featured-play" data-youtube="${escapeHtml(v.youtubeId)}">
            ▶ Play in page
          </button>
          <a class="btn-text btn-text--link" href="${escapeHtml(watch)}" target="_blank" rel="noopener noreferrer">Open on YouTube →</a>
        </div>
      </div>
      <div class="media-featured-player" id="featured-player-wrap">
        <button type="button" class="media-featured-poster" id="btn-featured-poster" data-youtube="${escapeHtml(v.youtubeId)}" aria-label="Play ${escapeHtml(v.title)}">
          <img src="https://i.ytimg.com/vi/${escapeHtml(v.youtubeId)}/maxresdefault.jpg" alt="" loading="eager" onerror="this.src='https://i.ytimg.com/vi/${escapeHtml(v.youtubeId)}/hqdefault.jpg'" />
          <span class="media-featured-poster-play" aria-hidden="true">▶</span>
        </button>
      </div>
    </section>
  `;
}

export function renderPodcastPlatforms(): string {
  return `
    <section class="media-platforms" aria-labelledby="platforms-heading">
      <h2 class="media-section-title" id="platforms-heading">Listen to the full podcast</h2>
      <p class="media-section-lede">Every quest level maps to a chapter from Naval’s 3-hour “How to Get Rich” episode.</p>
      <ul class="platform-grid">
        ${PODCAST_PLATFORMS.map(
          (p) => `
          <li>
            <a class="platform-card" href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer">
              <span class="platform-icon" aria-hidden="true">${p.icon}</span>
              <span class="platform-label">${escapeHtml(p.label)}</span>
              <span class="platform-sublabel">${escapeHtml(p.sublabel)}</span>
            </a>
          </li>`
        ).join('')}
      </ul>
    </section>
  `;
}

export function renderTopVideosGrid(opts: { compact?: boolean; limit?: number } = {}): string {
  const { compact = false, limit } = opts;
  const videos = limit ? TOP_VIDEOS.slice(0, limit) : TOP_VIDEOS;

  return `
    <section class="media-videos" aria-labelledby="videos-heading">
      <h2 class="media-section-title" id="videos-heading">Top Naval videos</h2>
      <p class="media-section-lede">The interviews and compilations that shaped the quest — watch before or while you play.</p>
      <div class="media-grid${compact ? ' media-grid--compact' : ''}">
        ${videos.map((v) => renderVideoCard(v, compact)).join('')}
      </div>
    </section>
  `;
}

export function renderBooksRow(): string {
  return `
    <section class="media-books" aria-label="Books">
      <h2 class="media-section-title">Read</h2>
      <ul class="book-list">
        ${BOOKS.map(
          (b) => `
          <li>
            <a class="book-card" href="${escapeHtml(b.url)}" target="_blank" rel="noopener noreferrer">
              <span class="book-title">${escapeHtml(b.title)}</span>
              <span class="book-desc">${escapeHtml(b.description)}</span>
            </a>
          </li>`
        ).join('')}
        <li>
          <a class="book-card" href="${escapeHtml(TWEETSTORM_URL)}" target="_blank" rel="noopener noreferrer">
            <span class="book-title">How to Get Rich tweetstorm</span>
            <span class="book-desc">The original @naval thread — 39 tweets, one per level.</span>
          </a>
        </li>
      </ul>
    </section>
  `;
}

/** Full media hub for landing / how-it-works pages. */
export function renderMediaHub(opts: { compactVideos?: boolean; videoLimit?: number } = {}): string {
  return `
    <div class="media-hub">
      ${renderFeaturedVideo()}
      ${renderPodcastPlatforms()}
      ${renderTopVideosGrid({ compact: opts.compactVideos, limit: opts.videoLimit })}
      ${renderBooksRow()}
    </div>
  `;
}

/** Compact strip for in-level context. */
export function renderLevelMediaStrip(): string {
  const v = FEATURED_VIDEO;
  return `
    <aside class="level-media-strip" aria-label="Naval media">
      <span class="level-media-label">Naval media</span>
      <a class="level-media-link" href="${escapeHtml(youtubeWatchUrl(v.youtubeId))}" target="_blank" rel="noopener noreferrer">${escapeHtml(v.title)}</a>
      <span class="level-media-sep">·</span>
      <a class="level-media-link" href="https://nav.al/rich" target="_blank" rel="noopener noreferrer">Transcript</a>
      <span class="level-media-sep">·</span>
      <a class="level-media-link" href="${escapeHtml(TWEETSTORM_URL)}" target="_blank" rel="noopener noreferrer">Tweetstorm</a>
    </aside>
  `;
}

export function bindMediaHub(root: ParentNode): void {
  const mountEmbed = (youtubeId: string, container: HTMLElement, autoplay = false) => {
    container.innerHTML = `
      <iframe
        class="media-embed-frame"
        src="${escapeHtml(youtubeEmbedUrl(youtubeId))}${autoplay ? '&autoplay=1' : ''}"
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        loading="lazy"
      ></iframe>
    `;
  };

  root.querySelector('#btn-featured-play')?.addEventListener('click', () => {
    const id = (root.querySelector('#btn-featured-play') as HTMLElement)?.getAttribute('data-youtube');
    const wrap = root.querySelector('#featured-player-wrap') as HTMLElement | null;
    if (id && wrap) mountEmbed(id, wrap, true);
  });

  root.querySelector('#btn-featured-poster')?.addEventListener('click', () => {
    const id = (root.querySelector('#btn-featured-poster') as HTMLElement)?.getAttribute('data-youtube');
    const wrap = root.querySelector('#featured-player-wrap') as HTMLElement | null;
    if (id && wrap) mountEmbed(id, wrap, true);
  });

  root.querySelectorAll('.media-card-embed-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-youtube');
      if (!id) return;
      const card = btn.closest('.media-card');
      const existing = card?.querySelector('.media-inline-player');
      if (existing) {
        existing.remove();
        return;
      }
      const player = document.createElement('div');
      player.className = 'media-inline-player';
      card?.appendChild(player);
      mountEmbed(id, player, true);
      player.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });
}
