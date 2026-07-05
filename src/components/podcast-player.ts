import { getPodcastSegment, formatTimestamp, PODCAST_NAV_AL_URL } from '../data/podcast';
import { escapeHtml } from '../utils';

export function renderPodcastPlayer(levelId: number): string {
  const seg = getPodcastSegment(levelId);
  if (!seg) return '';

  const duration = seg.endSec - seg.startSec;
  const durationLabel = formatTimestamp(duration);

  return `
    <section class="podcast-block" aria-label="Naval podcast clip for this tweet">
      <div class="podcast-block-head">
        <span class="podcast-badge">Naval Podcast</span>
        <span class="podcast-chapter">${escapeHtml(seg.chapterTitle)}</span>
        <span class="podcast-time">${formatTimestamp(seg.startSec)} · ~${durationLabel}</span>
      </div>
      <p class="podcast-excerpt">${escapeHtml(seg.excerpt)}</p>
      <div class="podcast-actions">
        <button type="button" class="btn-podcast-play" id="btn-podcast-play" data-embed="${escapeHtml(seg.embedUrl)}" data-youtube="${escapeHtml(seg.youtubeUrl)}">
          <span class="btn-podcast-icon" aria-hidden="true">▶</span>
          Hear Naval on this tweet
        </button>
        <a class="btn-text btn-text--link" href="${escapeHtml(PODCAST_NAV_AL_URL)}" target="_blank" rel="noopener noreferrer">Full transcript →</a>
      </div>
      <div class="podcast-frame-wrap" id="podcast-frame-wrap" hidden>
        <iframe
          id="podcast-frame"
          class="podcast-frame"
          title="Naval — How to Get Rich podcast clip"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
        ></iframe>
      </div>
    </section>
  `;
}

export function bindPodcastPlayer(root: ParentNode): void {
  const btn = root.querySelector('#btn-podcast-play') as HTMLButtonElement | null;
  const wrap = root.querySelector('#podcast-frame-wrap') as HTMLElement | null;
  const frame = root.querySelector('#podcast-frame') as HTMLIFrameElement | null;
  if (!btn || !wrap || !frame) return;

  btn.addEventListener('click', () => {
    const embed = btn.getAttribute('data-embed');
    if (!embed) return;

    if (wrap.hidden) {
      frame.src = `${embed}&autoplay=1`;
      wrap.hidden = false;
      btn.innerHTML = '<span class="btn-podcast-icon" aria-hidden="true">⏸</span> Hide clip';
    } else {
      frame.src = '';
      wrap.hidden = true;
      btn.innerHTML =
        '<span class="btn-podcast-icon" aria-hidden="true">▶</span> Hear Naval on this tweet';
    }
  });
}
