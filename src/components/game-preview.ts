import { TOTAL_LEVELS } from '../data/tweets';
import { escapeHtml } from '../utils';

export function renderGamePreview(opts: {
  saved: number;
  perLevel: string;
  resumeLabel: string;
}): string {
  const { saved, perLevel, resumeLabel } = opts;
  const levelNum = Math.min(saved + 1, TOTAL_LEVELS);
  const progressPct = Math.round((saved / TOTAL_LEVELS) * 100);

  return `
    <section class="game-preview" aria-label="Game preview">
      <div class="game-preview-window">
        <header class="game-preview-chrome">
          <span class="game-preview-dots" aria-hidden="true"><i></i><i></i><i></i></span>
          <span class="game-preview-level">Level ${levelNum} / ${TOTAL_LEVELS}</span>
        </header>
        <article class="game-preview-tweet">
          <div class="game-preview-tweet-head">
            <span class="game-preview-avatar">N</span>
            <div>
              <strong>Naval Ravikant</strong>
              <span>@naval</span>
            </div>
          </div>
          <p class="game-preview-tweet-text">Seek wealth, not money or status. Wealth is having assets that earn while you sleep.</p>
        </article>
        <div class="game-preview-puzzle">
          <p class="game-preview-prompt">Which earns while you sleep?</p>
          <div class="game-preview-options">
            <button class="game-preview-opt" type="button" disabled>Hourly wage</button>
            <button class="game-preview-opt game-preview-opt--pick" type="button" disabled>Assets &amp; leverage</button>
            <button class="game-preview-opt" type="button" disabled>Status games</button>
          </div>
          <div class="game-preview-cursor" aria-hidden="true"></div>
        </div>
        <footer class="game-preview-foot">
          <span class="game-preview-reward anim-reward-pulse">+${escapeHtml(perLevel)}</span>
          <div class="game-preview-bar" role="progressbar" aria-valuenow="${saved}" aria-valuemin="0" aria-valuemax="${TOTAL_LEVELS}">
            <span style="width:${progressPct}%"></span>
          </div>
        </footer>
      </div>
      <div class="game-preview-cta">
        <button class="btn-primary btn-primary--xl" id="btn-start" type="button">${escapeHtml(resumeLabel)} →</button>
        <p class="game-preview-note">Free to play · Sign up to earn ${escapeHtml(perLevel.split(' ')[1] || 'NAV')}</p>
      </div>
    </section>
  `;
}
