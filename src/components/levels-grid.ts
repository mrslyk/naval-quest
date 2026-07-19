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
import { tweetPhrases, tweetHook } from '../utils/tweet-phrases';
import { getLevelTweetText } from './tweet-play';

const TYPE_LABEL: Record<string, string> = {
  sort: 'Sort the lesson',
  choice: 'Choose the belief',
  'tap-sequence': 'Sequence the path',
  match: 'Match the idea',
  slider: 'Find the balance',
  'partner-pick': 'Pick partners',
  compound: 'Compound it',
  path: 'Walk the path',
  collect: 'Collect leverage',
  avoid: 'Ignore the noise',
};

function phraseTiles(level: TweetLevel): string {
  const phrases = tweetPhrases(getLevelTweetText(level), 4);
  return `
    <div class="lg-phrase-rail" aria-hidden="true">
      ${phrases
        .map(
          (p, i) => `
        <span class="lg-phrase" style="--i:${i}">${escapeHtml(p)}</span>`
        )
        .join('')}
    </div>`;
}

function renderGameMini(level: TweetLevel): string {
  const type = level.type;
  const label = TYPE_LABEL[type] ?? type;
  const hook = tweetHook(getLevelTweetText(level));

  switch (type) {
    case 'sort': {
      const cfg = level.config as SortConfig;
      return `
        <div class="lg-game lg-game--sort lg-anim">
          <span class="lg-game-type">${escapeHtml(label)}</span>
          <p class="lg-hook">“${escapeHtml(hook)}”</p>
          <div class="lg-buckets">
            ${cfg.buckets
              .slice(0, 3)
              .map(
                (b, i) =>
                  `<span class="lg-bucket" style="--i:${i}">${escapeHtml(b.label)}</span>`
              )
              .join('')}
          </div>
          <div class="lg-chips lg-chips--drift">
            ${cfg.items
              .slice(0, 4)
              .map(
                (item, i) =>
                  `<span class="lg-chip lg-chip--drift" style="--i:${i}">${item.icon} ${escapeHtml(item.label)}</span>`
              )
              .join('')}
          </div>
          ${phraseTiles(level)}
        </div>`;
    }
    case 'choice': {
      const cfg = level.config as ChoiceConfig;
      return `
        <div class="lg-game lg-game--choice lg-anim">
          <span class="lg-game-type">${escapeHtml(label)}</span>
          <p class="lg-hook">“${escapeHtml(hook)}”</p>
          <p class="lg-prompt">${escapeHtml(cfg.prompt)}</p>
          <div class="lg-opts">
            ${cfg.options
              .map(
                (o, i) =>
                  `<span class="lg-opt${o.correct ? ' lg-opt--yes lg-opt--pulse' : ''}" style="--i:${i}">${o.icon} ${escapeHtml(o.label)}</span>`
              )
              .join('')}
          </div>
          ${phraseTiles(level)}
        </div>`;
    }
    case 'tap-sequence': {
      const cfg = level.config as TapSequenceConfig;
      return `
        <div class="lg-game lg-anim">
          <span class="lg-game-type">${escapeHtml(label)}</span>
          <p class="lg-hook">“${escapeHtml(hook)}”</p>
          <div class="lg-chips lg-chips--seq">
            ${cfg.sequence
              .map(
                (s, i) =>
                  `<span class="lg-chip lg-chip--seq" style="--i:${i}"><em>${i + 1}</em> ${s.icon} ${escapeHtml(s.label)}</span>`
              )
              .join('')}
          </div>
          ${phraseTiles(level)}
        </div>`;
    }
    case 'match': {
      const cfg = level.config as MatchConfig;
      return `
        <div class="lg-game lg-anim">
          <span class="lg-game-type">${escapeHtml(label)}</span>
          <p class="lg-hook">“${escapeHtml(hook)}”</p>
          <div class="lg-match lg-match--anim">
            <div>${cfg.left.map((l, i) => `<span class="lg-chip" style="--i:${i}">${escapeHtml(l.label)}</span>`).join('')}</div>
            <div>${cfg.right.map((r, i) => `<span class="lg-chip lg-chip--link" style="--i:${i}">${escapeHtml(r.label)}</span>`).join('')}</div>
          </div>
          ${phraseTiles(level)}
        </div>`;
    }
    case 'slider': {
      const cfg = level.config as SliderConfig;
      const pct = Math.round(((cfg.target - cfg.min) / (cfg.max - cfg.min)) * 100);
      return `
        <div class="lg-game lg-anim">
          <span class="lg-game-type">${escapeHtml(label)}</span>
          <p class="lg-hook">“${escapeHtml(hook)}”</p>
          <p class="lg-prompt">${escapeHtml(cfg.prompt)}</p>
          <div class="lg-slider"><i style="--pct:${pct}%"></i></div>
          ${phraseTiles(level)}
        </div>`;
    }
    case 'partner-pick': {
      const cfg = level.config as PartnerPickConfig;
      return `
        <div class="lg-game lg-anim">
          <span class="lg-game-type">${escapeHtml(label)}</span>
          <p class="lg-hook">“${escapeHtml(hook)}”</p>
          <div class="lg-chips">
            ${cfg.candidates
              .slice(0, 4)
              .map(
                (c, i) =>
                  `<span class="lg-chip lg-chip--partner" style="--i:${i}">${escapeHtml(c.name)}</span>`
              )
              .join('')}
          </div>
          ${phraseTiles(level)}
        </div>`;
    }
    case 'collect': {
      const cfg = level.config as CollectConfig;
      return `
        <div class="lg-game lg-anim">
          <span class="lg-game-type">${escapeHtml(label)}</span>
          <p class="lg-hook">“${escapeHtml(hook)}”</p>
          <div class="lg-chips lg-chips--pop">
            ${cfg.items
              .slice(0, 5)
              .map(
                (item, i) =>
                  `<span class="lg-chip${item.permissionless ? ' lg-chip--good lg-chip--pop' : ' lg-chip--bad'}" style="--i:${i}">${item.icon} ${escapeHtml(item.label)}</span>`
              )
              .join('')}
          </div>
          ${phraseTiles(level)}
        </div>`;
    }
    case 'avoid': {
      const cfg = level.config as AvoidConfig;
      return `
        <div class="lg-game lg-anim">
          <span class="lg-game-type">${escapeHtml(label)}</span>
          <p class="lg-hook">“${escapeHtml(hook)}”</p>
          <div class="lg-chips lg-chips--avoid">
            ${cfg.good
              .map(
                (g, i) =>
                  `<span class="lg-chip lg-chip--good lg-chip--pop" style="--i:${i}">${g.icon} ${escapeHtml(g.label)}</span>`
              )
              .join('')}
            ${cfg.bad
              .slice(0, 2)
              .map(
                (b, i) =>
                  `<span class="lg-chip lg-chip--bad lg-chip--fade" style="--i:${i}">${b.icon} ${escapeHtml(b.label)}</span>`
              )
              .join('')}
          </div>
          ${phraseTiles(level)}
        </div>`;
    }
    case 'compound':
      return `
        <div class="lg-game lg-anim lg-game--compound">
          <span class="lg-game-type">${escapeHtml(label)}</span>
          <p class="lg-hook">“${escapeHtml(hook)}”</p>
          <div class="lg-compound">
            <span class="lg-compound-bar" style="--grow:1"></span>
            <span class="lg-compound-bar" style="--grow:2"></span>
            <span class="lg-compound-bar" style="--grow:3"></span>
            <span class="lg-compound-bar" style="--grow:4"></span>
          </div>
          ${phraseTiles(level)}
        </div>`;
    default:
      return `
        <div class="lg-game lg-anim">
          <span class="lg-game-type">${escapeHtml(label)}</span>
          <p class="lg-hook">“${escapeHtml(hook)}”</p>
          <p class="lg-prompt">${escapeHtml(level.title)}</p>
          ${phraseTiles(level)}
        </div>`;
  }
}

export function renderLevelsGrid(opts: {
  saved: number;
  perLevel: string;
  levelRewards?: Array<{ level: number; amountLabel: string }>;
  symbol?: string;
}): string {
  const { saved, levelRewards = [], symbol = 'NAV' } = opts;
  const total = TWEET_LEVELS_ALL.length;
  const rewardByLevel = new Map(levelRewards.map((r) => [r.level, r.amountLabel]));

  const rows = TWEET_LEVELS_ALL.map((level, index) => {
    const done = index < saved;
    const current = index === saved;
    const locked = index > saved;
    const state = done ? 'done' : current ? 'now' : 'locked';
    const rewardLabel = rewardByLevel.get(level.id) || `${10 + index} ${symbol}`;

    return `
      <article class="lg-row lg-row--${state}" data-level-index="${index}" ${locked ? '' : 'tabindex="0" role="button"'}>
        <div class="lg-box lg-box--tweet">
          <header class="lg-tweet-head">
            <span class="lg-num">${done ? '✓' : level.id}</span>
            <span class="lg-title">${escapeHtml(level.title)}</span>
          </header>
          <blockquote class="lg-tweet">“${escapeHtml(getLevelTweetText(level))}”</blockquote>
        </div>
        <div class="lg-box lg-box--game">
          ${renderGameMini(level)}
        </div>
        <div class="lg-box lg-box--reward">
          <span class="lg-reward${done ? ' lg-reward--won' : ''}">+${escapeHtml(rewardLabel)}</span>
          <span class="lg-reward-state">${done ? 'Earned' : current ? 'Play now' : 'Locked'}</span>
        </div>
      </article>`;
  }).join('');

  return `
    <section class="levels-grid" aria-label="All ${total} levels">
      <header class="lg-head">
        <h2 class="lg-heading">${total} tweets · 3 columns</h2>
        <p class="lg-sub">Tweet · Game · Reward</p>
      </header>

      <div class="lg-board">
        <div class="lg-board-head" aria-hidden="true">
          <div class="lg-box lg-box--head">Tweet</div>
          <div class="lg-box lg-box--head">Game</div>
          <div class="lg-box lg-box--head">Reward</div>
        </div>
        <div class="lg-board-body">
          ${rows}
        </div>
      </div>
    </section>
  `;
}
