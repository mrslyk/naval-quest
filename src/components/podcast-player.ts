import { getPodcastSegment, formatTimestamp, PODCAST_NAV_AL_URL, PODCAST_APPLE_SHOW_URL, PODCAST_SPOTIFY_URL } from '../data/podcast';
import { getNavalRichLevel, navAlSectionUrl } from '../data/naval-rich';
import { escapeHtml } from '../utils';

function pickExcerpt(levelId: number): string {
  const rich = getNavalRichLevel(levelId);
  if (rich?.navalQuotes[0]) return rich.navalQuotes[0];
  if (rich?.taglines[0]) return rich.taglines[0];
  const seg = getPodcastSegment(levelId);
  return seg?.excerpt ?? '';
}

export function renderPodcastPlayer(levelId: number): string {
  const seg = getPodcastSegment(levelId);
  const rich = getNavalRichLevel(levelId);
  if (!seg && !rich) return '';

  const chapterTitle = rich?.sectionTitle ?? seg?.chapterTitle ?? 'How to Get Rich';
  const excerpt = pickExcerpt(levelId);
  const transcriptUrl = navAlSectionUrl(levelId);
  const startSec = seg?.startSec ?? 0;
  const endSec = seg?.endSec ?? startSec + 300;
  const duration = endSec - startSec;
  const durationLabel = formatTimestamp(duration);
  const embedUrl = seg?.embedUrl ?? '';
  const youtubeUrl = seg?.youtubeUrl ?? PODCAST_NAV_AL_URL;

  return `
    <section class="podcast-block" aria-label="Naval podcast clip for this tweet">
      <div class="podcast-block-head">
        <span class="podcast-badge">Naval Podcast</span>
        <a class="podcast-chapter podcast-chapter--link" href="${escapeHtml(transcriptUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(chapterTitle)}</a>
        ${
          seg
            ? `<span class="podcast-time" title="Transcript-aligned clip">${formatTimestamp(startSec)}–${formatTimestamp(endSec)} · ~${durationLabel}</span>`
            : ''
        }
      </div>
      ${excerpt ? `<p class="podcast-excerpt">${escapeHtml(excerpt)}</p>` : ''}
      <div class="podcast-actions">
        ${
          embedUrl
            ? `<button type="button" class="btn-podcast-play" id="btn-podcast-play" data-embed="${escapeHtml(embedUrl)}" data-youtube="${escapeHtml(youtubeUrl)}">
          <span class="btn-podcast-icon" aria-hidden="true">▶</span>
          Hear Naval at ${formatTimestamp(startSec)}
        </button>`
            : ''
        }
        <a class="btn-text btn-text--link" href="${escapeHtml(transcriptUrl)}" target="_blank" rel="noopener noreferrer">Read on nav.al/rich →</a>
        <a class="btn-text btn-text--link" href="${escapeHtml(youtubeUrl)}" target="_blank" rel="noopener noreferrer">YouTube →</a>
        <a class="btn-text btn-text--link" href="${escapeHtml(PODCAST_APPLE_SHOW_URL)}" target="_blank" rel="noopener noreferrer">Apple →</a>
        <a class="btn-text btn-text--link" href="${escapeHtml(PODCAST_SPOTIFY_URL)}" target="_blank" rel="noopener noreferrer">Spotify →</a>
      </div>
      ${
        embedUrl
          ? `<div class="podcast-frame-wrap" id="podcast-frame-wrap" hidden>
        <iframe
          id="podcast-frame"
          class="podcast-frame"
          title="Naval — How to Get Rich podcast clip"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
        ></iframe>
      </div>`
          : ''
      }
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
      let stamp = 'this tweet';
      try {
        const start = new URL(embed).searchParams.get('start');
        if (start != null) stamp = formatTimestamp(Number(start));
      } catch {
        /* keep fallback label */
      }
      btn.innerHTML = `<span class="btn-podcast-icon" aria-hidden="true">▶</span> Hear Naval at ${stamp}`;
    }
  });
}
