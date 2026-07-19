import { TOTAL_LEVELS } from '../data/tweets';
import { escapeHtml } from '../utils';

/** Wordle-style tile board that flips through a sample guess. */
export function renderGamePreview(opts: {
  saved: number;
  perLevel: string;
  resumeLabel: string;
}): string {
  const { saved, perLevel, resumeLabel } = opts;
  const levelNum = Math.min(saved + 1, TOTAL_LEVELS);

  // Sample "WEALTH" row — Wordle flip states
  const tiles = [
    { letter: 'W', state: 'correct' },
    { letter: 'E', state: 'present' },
    { letter: 'A', state: 'absent' },
    { letter: 'L', state: 'correct' },
    { letter: 'T', state: 'absent' },
    { letter: 'H', state: 'correct' },
  ];

  return `
    <section class="wq-board-wrap" aria-label="Game preview">
      <div class="wq-board" role="img" aria-label="Example puzzle tiles">
        ${tiles
          .map(
            (t, i) => `
          <div class="wq-tile wq-tile--${t.state}" style="--i:${i}">
            <span class="wq-tile-letter">${t.letter}</span>
          </div>`
          )
          .join('')}
      </div>
      <p class="wq-board-caption">
        Level ${levelNum} of ${TOTAL_LEVELS}
        ${saved > 0 ? ` · ${saved} cleared` : ''}
        · +${escapeHtml(perLevel)} next
      </p>
      <button class="wq-play" id="btn-start" type="button">${escapeHtml(resumeLabel)}</button>
    </section>
  `;
}
