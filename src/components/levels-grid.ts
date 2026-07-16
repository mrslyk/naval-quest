import {
  TweetLevel,
  TWEET_LEVELS_ALL,
  ChoiceConfig,
  SortConfig,
  TapSequenceConfig,
  MatchConfig,
  CollectConfig,
  AvoidConfig,
  PartnerPickConfig,
  SliderConfig,
} from '../data/tweets';
import { escapeHtml } from '../utils';

const TYPE_LABEL: Record<string, string> = {
  sort: 'Sort',
  choice: 'Choose',
  'tap-sequence': 'Sequence',
  match: 'Match',
  slider: 'Slider',
  'partner-pick': 'Partners',
  compound: 'Compound',
  path: 'Path',
  collect: 'Collect',
  avoid: 'Avoid',
};

function renderGameMini(level: TweetLevel): string {
  const type = level.type;
  const label = TYPE_LABEL[type] ?? type;

  switch (type) {
    case 'sort': {
      const cfg = level.config as SortConfig;
      return `
        <div class="lg-game lg-game--sort">
          <span class="lg-game-type">${escapeHtml(label)}</span>
          <div class="lg-buckets">
            ${cfg.buckets
              .slice(0, 3)
              .map((b) => `<span class="lg-bucket">${escapeHtml(b.label)}</span>`)
              .join('')}
          </div>
          <div class="lg-chips">
            ${cfg.items
              .slice(0, 4)
              .map((i) => `<span class="lg-chip">${i.icon} ${escapeHtml(i.label)}</span>`)
              .join('')}
          </div>
        </div>`;
    }
    case 'choice': {
      const cfg = level.config as ChoiceConfig;
      return `
        <div class="lg-game lg-game--choice">
          <span class="lg-game-type">${escapeHtml(label)}</span>
          <p class="lg-prompt">${escapeHtml(cfg.prompt)}</p>
          <div class="lg-opts">
            ${cfg.options
              .map(
                (o) =>
                  `<span class="lg-opt${o.correct ? ' lg-opt--yes' : ''}">${o.icon} ${escapeHtml(o.label)}</span>`
              )
              .join('')}
          </div>
        </div>`;
    }
    case 'tap-sequence': {
      const cfg = level.config as TapSequenceConfig;
      return `
        <div class="lg-game">
          <span class="lg-game-type">${escapeHtml(label)}</span>
          <p class="lg-prompt">${escapeHtml(cfg.prompt)}</p>
          <div class="lg-chips">
            ${cfg.sequence
              .map((s, i) => `<span class="lg-chip"><em>${i + 1}</em> ${s.icon} ${escapeHtml(s.label)}</span>`)
              .join('')}
          </div>
        </div>`;
    }
    case 'match': {
      const cfg = level.config as MatchConfig;
      return `
        <div class="lg-game">
          <span class="lg-game-type">${escapeHtml(label)}</span>
          <div class="lg-match">
            <div>${cfg.left.map((l) => `<span class="lg-chip">${escapeHtml(l.label)}</span>`).join('')}</div>
            <div>${cfg.right.map((r) => `<span class="lg-chip">${escapeHtml(r.label)}</span>`).join('')}</div>
          </div>
        </div>`;
    }
    case 'slider': {
      const cfg = level.config as SliderConfig;
      return `
        <div class="lg-game">
          <span class="lg-game-type">${escapeHtml(label)}</span>
          <p class="lg-prompt">${escapeHtml(cfg.prompt)}</p>
          <div class="lg-slider"><i style="left:${Math.round(((cfg.target - cfg.min) / (cfg.max - cfg.min)) * 100)}%"></i></div>
        </div>`;
    }
    case 'partner-pick': {
      const cfg = level.config as PartnerPickConfig;
      return `
        <div class="lg-game">
          <span class="lg-game-type">${escapeHtml(label)}</span>
          <div class="lg-chips">
            ${cfg.candidates
              .slice(0, 4)
              .map((c) => `<span class="lg-chip">${escapeHtml(c.name)}</span>`)
              .join('')}
          </div>
        </div>`;
    }
    case 'collect': {
      const cfg = level.config as CollectConfig;
      return `
        <div class="lg-game">
          <span class="lg-game-type">${escapeHtml(label)}</span>
          <p class="lg-prompt">${escapeHtml(cfg.prompt)}</p>
          <div class="lg-chips">
            ${cfg.items
              .slice(0, 5)
              .map((i) => `<span class="lg-chip">${i.icon} ${escapeHtml(i.label)}</span>`)
              .join('')}
          </div>
        </div>`;
    }
    case 'avoid': {
      const cfg = level.config as AvoidConfig;
      return `
        <div class="lg-game">
          <span class="lg-game-type">${escapeHtml(label)}</span>
          <p class="lg-prompt">${escapeHtml(cfg.prompt)}</p>
          <div class="lg-chips">
            ${cfg.good
              .map((g) => `<span class="lg-chip lg-chip--good">${g.icon} ${escapeHtml(g.label)}</span>`)
              .join('')}
            ${cfg.bad
              .slice(0, 2)
              .map((b) => `<span class="lg-chip lg-chip--bad">${b.icon} ${escapeHtml(b.label)}</span>`)
              .join('')}
          </div>
        </div>`;
    }
    default:
      return `
        <div class="lg-game">
          <span class="lg-game-type">${escapeHtml(label)}</span>
          <p class="lg-prompt">${escapeHtml(level.title)}</p>
        </div>`;
  }
}

export function renderLevelsGrid(opts: {
  saved: number;
  perLevel: string;
}): string {
  const { saved, perLevel } = opts;

  const rows = TWEET_LEVELS_ALL.map((level, index) => {
    const done = index < saved;
    const current = index === saved;
    const locked = index > saved;
    const state = done ? 'done' : current ? 'now' : 'locked';

    return `
      <article class="lg-row lg-row--${state}" data-level-index="${index}" ${locked ? '' : 'tabindex="0" role="button"'}>
        <div class="lg-col lg-col--tweet">
          <header class="lg-tweet-head">
            <span class="lg-num">${done ? '✓' : level.id}</span>
            <span class="lg-title">${escapeHtml(level.title)}</span>
          </header>
          <blockquote class="lg-tweet">“${escapeHtml(level.tweet)}”</blockquote>
        </div>
        <div class="lg-col lg-col--game">
          ${renderGameMini(level)}
        </div>
        <div class="lg-col lg-col--reward">
          <span class="lg-reward${done ? ' lg-reward--won' : ''}">+${escapeHtml(perLevel)}</span>
          <span class="lg-reward-state">${done ? 'Earned' : current ? 'Play now' : 'Locked'}</span>
        </div>
      </article>`;
  }).join('');

  return `
    <section class="levels-grid" aria-label="All ${TWEET_LEVELS_ALL.length} levels">
      <header class="lg-head">
        <h2 class="lg-heading">The ${TWEET_LEVELS_ALL.length} levels</h2>
        <p class="lg-sub">Tweet · Game · Reward — every level in the quest.</p>
      </header>
      <div class="lg-table-head" aria-hidden="true">
        <span>Tweet</span>
        <span>Game</span>
        <span>Reward</span>
      </div>
      <div class="lg-rows">
        ${rows}
      </div>
    </section>
  `;
}
