import {
  TweetLevel,
  SortConfig,
  ChoiceConfig,
  TapSequenceConfig,
  MatchConfig,
  SliderConfig,
  PartnerPickConfig,
  CompoundConfig,
  PathConfig,
  CollectConfig,
  AvoidConfig,
} from '../data/tweets';
import { riddleFor } from '../data/riddles';
import { escapeHtml, shuffle } from '../utils';
import { signalCorrectStep, tweetHook } from '../utils/tweet-phrases';
import { getLevelTweetText } from '../components/tweet-play';

export type LevelCompleteCallback = () => void;

function renderRiddleHeader(level: TweetLevel): string {
  const hook = tweetHook(getLevelTweetText(level));
  return `
    <p class="tweet-echo" aria-hidden="true">“${escapeHtml(hook)}”</p>
    <p class="riddle">${escapeHtml(riddleFor(level))}</p>
  `;
}

function noteCorrect(el: HTMLElement): void {
  signalCorrectStep(el);
}

export function mountLevel(
  container: HTMLElement,
  level: TweetLevel,
  onComplete: LevelCompleteCallback
): void {
  const handlers: Record<string, (el: HTMLElement, cb: LevelCompleteCallback) => void> = {
    sort: mountSort,
    choice: mountChoice,
    'tap-sequence': mountTapSequence,
    match: mountMatch,
    slider: mountSlider,
    'partner-pick': mountPartnerPick,
    compound: mountCompound,
    path: mountPath,
    collect: mountCollect,
    avoid: mountAvoid,
  };

  const handler = handlers[level.type];
  if (!handler) {
    container.innerHTML = '<p class="error">Unknown level type</p>';
    return;
  }
  handler(container, onComplete);
}

function levelRoot(container: HTMLElement): HTMLElement {
  return (container.closest('.playfield') ?? container) as HTMLElement;
}

function showFeedback(el: HTMLElement, correct: boolean, message?: string): void {
  const existing = el.querySelector('.feedback-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `feedback-toast ${correct ? 'correct' : 'wrong'}`;
  toast.textContent =
    message ??
    (correct ? '✓ Nice — keep going' : 'Not quite — reread the tweet and try again');
  el.appendChild(toast);
  setTimeout(() => toast.remove(), correct ? 700 : 1600);

  if (correct) noteCorrect(el);
}

function mountSort(container: HTMLElement, onComplete: LevelCompleteCallback): void {
  const levelEl = levelRoot(container) as HTMLElement;
  const levelData = (window as unknown as { __currentLevel?: TweetLevel }).__currentLevel;
  if (!levelData || levelData.type !== 'sort') return;
  const cfg = levelData.config as SortConfig;

  const items = shuffle(cfg.items);

  container.innerHTML = `
    <div class="sort-game">
      ${renderRiddleHeader(levelData)}
      <div class="sort-items" id="sort-pool">
        ${items
          .map(
            (item) => `
          <div class="sort-item" draggable="true" data-id="${item.id}" data-bucket="${item.bucket}">
            <span class="item-icon">${item.icon}</span>
            <span>${escapeHtml(item.label)}</span>
          </div>`
          )
          .join('')}
      </div>
      <div class="sort-buckets">
        ${cfg.buckets
          .map(
            (b) => `
          <div class="sort-bucket" data-bucket="${b.id}">
            <h4>${escapeHtml(b.label)}</h4>
            <p class="bucket-hint">${escapeHtml(b.hint)}</p>
            <div class="bucket-drop" data-bucket="${b.id}"></div>
          </div>`
          )
          .join('')}
      </div>
    </div>
  `;

  const pool = container.querySelector('#sort-pool')!;
  const drops = container.querySelectorAll('.bucket-drop');

  container.querySelectorAll('.sort-item').forEach((item) => {
    const el = item as HTMLElement;
    el.addEventListener('dragstart', (e) => {
      e.dataTransfer?.setData('text/plain', el.dataset.id!);
      el.classList.add('dragging');
    });
    el.addEventListener('dragend', () => el.classList.remove('dragging'));

    el.addEventListener('click', () => {
      const emptyDrop = [...drops].find((d) => !d.querySelector('.sort-item'));
      if (emptyDrop) {
        emptyDrop.appendChild(el);
        checkSort();
      }
    });
  });

  drops.forEach((drop) => {
    drop.addEventListener('dragover', (e) => {
      e.preventDefault();
      drop.classList.add('drag-over');
    });
    drop.addEventListener('dragleave', () => drop.classList.remove('drag-over'));
    drop.addEventListener('drop', (e) => {
      e.preventDefault();
      drop.classList.remove('drag-over');
      const id = (e as DragEvent).dataTransfer?.getData('text/plain');
      const item = container.querySelector(`[data-id="${id}"]`) as HTMLElement;
      if (item) {
        drop.appendChild(item);
        checkSort();
      }
    });
  });

  function checkSort(): void {
    let allPlaced = true;
    let allCorrect = true;
    let newlyCorrect = 0;
    cfg.items.forEach((item) => {
      const el = container.querySelector(`[data-id="${item.id}"]`) as HTMLElement;
      const parent = el?.closest('.bucket-drop') as HTMLElement | null;
      if (!parent) {
        allPlaced = false;
        return;
      }
      const ok = parent.dataset.bucket === item.bucket;
      if (!ok) allCorrect = false;
      else if (!el.dataset.phraseNoted) {
        el.dataset.phraseNoted = '1';
        newlyCorrect += 1;
      }
    });

    for (let i = 0; i < newlyCorrect; i++) noteCorrect(levelEl);

    if (allPlaced && allCorrect) {
      showFeedback(levelEl, true, 'Sorted — each jar matches Naval’s definitions');
      setTimeout(onComplete, 700);
    } else if (allPlaced) {
      showFeedback(levelEl, false, 'Check the buckets again — one or more items are off');
    }
  }
}

function mountChoice(container: HTMLElement, onComplete: LevelCompleteCallback): void {
  const levelData = (window as unknown as { __currentLevel?: TweetLevel }).__currentLevel;
  if (!levelData || levelData.type !== 'choice') return;
  const cfg = levelData.config as ChoiceConfig;
  const levelEl = levelRoot(container) as HTMLElement;

  container.innerHTML = `
    <div class="choice-game">
      ${renderRiddleHeader(levelData)}
      <p class="game-prompt">${escapeHtml(cfg.prompt)}</p>
      <div class="choice-grid">
        ${cfg.options
          .map(
            (opt) => `
          <button class="choice-btn" data-id="${opt.id}" data-correct="${opt.correct}">
            <span class="choice-icon">${opt.icon}</span>
            <span class="choice-label">${escapeHtml(opt.label)}</span>
            ${opt.sublabel ? `<span class="choice-sub">${escapeHtml(opt.sublabel)}</span>` : ''}
          </button>`
          )
          .join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('.choice-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const correct = (btn as HTMLElement).dataset.correct === 'true';
      if (correct) {
        btn.classList.add('selected-correct');
        showFeedback(levelEl, true);
        setTimeout(onComplete, 800);
      } else {
        btn.classList.add('selected-wrong');
        showFeedback(levelEl, false);
        setTimeout(() => btn.classList.remove('selected-wrong'), 500);
      }
    });
  });
}

function mountTapSequence(container: HTMLElement, onComplete: LevelCompleteCallback): void {
  const levelData = (window as unknown as { __currentLevel?: TweetLevel }).__currentLevel;
  if (!levelData || levelData.type !== 'tap-sequence') return;
  const cfg = levelData.config as TapSequenceConfig;
  const levelEl = levelRoot(container) as HTMLElement;
  let step = 0;

  container.innerHTML = `
    <div class="tap-game">
      ${renderRiddleHeader(levelData)}
      <p class="game-prompt">${escapeHtml(cfg.prompt)}</p>
      <div class="tap-grid">
        ${cfg.sequence
          .map(
            (s, i) => `
          <button class="tap-btn" data-index="${i}" data-id="${s.id}" disabled="${i !== 0}">
            <span class="tap-icon">${s.icon}</span>
            <span>${escapeHtml(s.label)}</span>
            <span class="tap-step">${i + 1}</span>
          </button>`
          )
          .join('')}
      </div>
    </div>
  `;

  const buttons = container.querySelectorAll('.tap-btn');
  buttons.forEach((btn, i) => {
    if (i === 0) (btn as HTMLButtonElement).disabled = false;
    btn.addEventListener('click', () => {
      if (i !== step) {
        showFeedback(levelEl, false, `Tap step ${step + 1} first`);
        return;
      }
      btn.classList.add('tapped');
      (btn as HTMLButtonElement).disabled = true;
      step++;
      noteCorrect(levelEl);
      if (step < cfg.sequence.length) {
        (buttons[step] as HTMLButtonElement).disabled = false;
      } else {
        showFeedback(levelEl, true);
        setTimeout(onComplete, 700);
      }
    });
  });
}

function mountMatch(container: HTMLElement, onComplete: LevelCompleteCallback): void {
  const levelData = (window as unknown as { __currentLevel?: TweetLevel }).__currentLevel;
  if (!levelData || levelData.type !== 'match') return;
  const cfg = levelData.config as MatchConfig;
  const levelEl = levelRoot(container) as HTMLElement;
  let selectedLeft: string | null = null;
  const matched = new Set<string>();

  const leftItems = shuffle(cfg.left);
  const rightItems = shuffle(cfg.right);

  container.innerHTML = `
    <div class="match-game">
      ${renderRiddleHeader(levelData)}
      <div class="match-column">
        <h4>What society wants</h4>
        ${leftItems
          .map(
            (l) => `
          <button class="match-item left" data-id="${l.id}">${escapeHtml(l.label)}</button>`
          )
          .join('')}
      </div>
      <div class="match-column">
        <h4>How to deliver it</h4>
        ${rightItems
          .map(
            (r) => `
          <button class="match-item right" data-id="${r.id}" data-match="${r.matchId}">${escapeHtml(r.label)}</button>`
          )
          .join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('.match-item.left').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (matched.has((btn as HTMLElement).dataset.id!)) return;
      container.querySelectorAll('.match-item.left').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedLeft = (btn as HTMLElement).dataset.id!;
    });
  });

  container.querySelectorAll('.match-item.right').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!selectedLeft) return;
      const el = btn as HTMLElement;
      if (el.dataset.match === selectedLeft) {
        el.classList.add('matched');
        container.querySelector(`[data-id="${selectedLeft}"]`)?.classList.add('matched');
        matched.add(selectedLeft);
        selectedLeft = null;
        noteCorrect(levelEl);
        if (matched.size === cfg.left.length) {
          showFeedback(levelEl, true);
          setTimeout(onComplete, 700);
        }
      } else {
        showFeedback(levelEl, false, 'Not a match — try again');
        el.classList.add('wrong-flash');
        setTimeout(() => el.classList.remove('wrong-flash'), 400);
      }
    });
  });
}

function mountSlider(container: HTMLElement, onComplete: LevelCompleteCallback): void {
  const levelData = (window as unknown as { __currentLevel?: TweetLevel }).__currentLevel;
  if (!levelData || levelData.type !== 'slider') return;
  const cfg = levelData.config as SliderConfig;
  const levelEl = levelRoot(container) as HTMLElement;

  container.innerHTML = `
    <div class="slider-game">
      ${renderRiddleHeader(levelData)}
      <p class="game-prompt">${escapeHtml(cfg.prompt)}</p>
      <div class="slider-value" id="slider-display">${cfg.min}${cfg.unit}</div>
      <input type="range" class="game-slider" min="${cfg.min}" max="${cfg.max}" value="${cfg.min}" id="game-slider" />
      <div class="slider-labels">
        ${cfg.labels.map((l) => `<span>${escapeHtml(l.label)}</span>`).join('')}
      </div>
      <button class="btn-primary" id="slider-confirm">Lock it in</button>
    </div>
  `;

  const slider = container.querySelector('#game-slider') as HTMLInputElement;
  const display = container.querySelector('#slider-display')!;

  slider.addEventListener('input', () => {
    display.textContent = `${slider.value}${cfg.unit}`;
  });

  container.querySelector('#slider-confirm')!.addEventListener('click', () => {
    const val = parseInt(slider.value, 10);
    const ok = Math.abs(val - cfg.target) <= cfg.tolerance;
    if (ok) {
      showFeedback(levelEl, true);
      setTimeout(onComplete, 700);
    } else {
      showFeedback(levelEl, false, 'Naval says: aim higher on this one');
    }
  });
}

function mountPartnerPick(container: HTMLElement, onComplete: LevelCompleteCallback): void {
  const levelData = (window as unknown as { __currentLevel?: TweetLevel }).__currentLevel;
  if (!levelData || levelData.type !== 'partner-pick') return;
  const cfg = levelData.config as PartnerPickConfig;
  const levelEl = levelRoot(container) as HTMLElement;

  container.innerHTML = `
    <div class="partner-game">
      ${renderRiddleHeader(levelData)}
      <div class="partner-grid">
        ${cfg.candidates
          .map(
            (c) => `
          <button class="partner-card" data-id="${c.id}"
            data-int="${c.intelligence}" data-eng="${c.energy}" data-integ="${c.integrity}">
            <h4>${escapeHtml(c.name)}</h4>
            <div class="stat-bars">
              <div class="stat"><span>Intelligence</span><div class="bar"><div style="width:${c.intelligence * 10}%"></div></div></div>
              <div class="stat"><span>Energy</span><div class="bar"><div style="width:${c.energy * 10}%"></div></div></div>
              <div class="stat"><span>Integrity</span><div class="bar"><div style="width:${c.integrity * 10}%"></div></div></div>
            </div>
          </button>`
          )
          .join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('.partner-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      const el = btn as HTMLElement;
      const int = parseInt(el.dataset.int!, 10);
      const eng = parseInt(el.dataset.eng!, 10);
      const integ = parseInt(el.dataset.integ!, 10);
      const ok =
        int >= cfg.minStats.intelligence &&
        eng >= cfg.minStats.energy &&
        integ >= cfg.minStats.integrity;

      if (ok) {
        el.classList.add('selected-correct');
        showFeedback(levelEl, true);
        setTimeout(onComplete, 800);
      } else {
        el.classList.add('selected-wrong');
        showFeedback(levelEl, false, 'Need high intelligence, energy, AND integrity');
        setTimeout(() => el.classList.remove('selected-wrong'), 600);
      }
    });
  });
}

function mountCompound(container: HTMLElement, onComplete: LevelCompleteCallback): void {
  const levelData = (window as unknown as { __currentLevel?: TweetLevel }).__currentLevel;
  if (!levelData || levelData.type !== 'compound') return;
  const cfg = levelData.config as CompoundConfig;
  const levelEl = levelRoot(container) as HTMLElement;
  let wealth = 100;
  let round = 0;

  container.innerHTML = `
    <div class="compound-game">
      ${renderRiddleHeader(levelData)}
      <p class="game-prompt">${escapeHtml(cfg.prompt)}</p>
      <div class="compound-display">
        <span class="compound-label">Your wealth</span>
        <span class="compound-amount" id="wealth-amt">$${wealth.toFixed(0)}</span>
        <span class="compound-round" id="round-lbl">Round 0 / ${cfg.rounds}</span>
      </div>
      <button class="btn-primary btn-large" id="invest-btn">Invest & compound →</button>
    </div>
  `;

  const amtEl = container.querySelector('#wealth-amt')!;
  const roundEl = container.querySelector('#round-lbl')!;
  const btn = container.querySelector('#invest-btn')!;

  btn.addEventListener('click', () => {
    round++;
    wealth = Math.round(wealth * cfg.baseRate);
    amtEl.textContent = `$${wealth.toLocaleString()}`;
    roundEl.textContent = `Round ${round} / ${cfg.rounds}`;
    btn.classList.add('pulse');
    noteCorrect(levelEl);

    if (round >= cfg.rounds) {
      btn.textContent = 'Compounded!';
      (btn as HTMLButtonElement).disabled = true;
      showFeedback(levelEl, true, `$${wealth.toLocaleString()} — compound interest!`);
      setTimeout(onComplete, 1000);
    }
  });
}

function mountPath(container: HTMLElement, onComplete: LevelCompleteCallback): void {
  const levelData = (window as unknown as { __currentLevel?: TweetLevel }).__currentLevel;
  if (!levelData || levelData.type !== 'path') return;
  const cfg = levelData.config as PathConfig;
  const levelEl = levelRoot(container) as HTMLElement;
  const selected: string[] = [];

  const correctPath = ['n1', 'n2', 'n3', 'n4'];

  container.innerHTML = `
    <div class="path-game">
      ${renderRiddleHeader(levelData)}
      <p class="game-prompt">Tap the path to mastery:</p>
      <div class="path-nodes">
        ${cfg.nodes
          .map(
            (n) => `
          <button class="path-node" data-id="${n.id}" style="left:${n.x}%;top:${n.y}%">
            ${escapeHtml(n.label)}
          </button>`
          )
          .join('')}
      </div>
      <div class="path-trail" id="path-trail"></div>
    </div>
  `;

  container.querySelectorAll('.path-node').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.id!;
      const expected = correctPath[selected.length];
      if (id === expected) {
        selected.push(id);
        btn.classList.add('path-active');
        noteCorrect(levelEl);
        if (selected.length === correctPath.length) {
          showFeedback(levelEl, true);
          setTimeout(onComplete, 800);
        }
      } else {
        showFeedback(levelEl, false, 'Wrong path — start from Generalist');
        selected.length = 0;
        container.querySelectorAll('.path-node').forEach((b) => b.classList.remove('path-active'));
      }
    });
  });
}

function mountCollect(container: HTMLElement, onComplete: LevelCompleteCallback): void {
  const levelData = (window as unknown as { __currentLevel?: TweetLevel }).__currentLevel;
  if (!levelData || levelData.type !== 'collect') return;
  const cfg = levelData.config as CollectConfig;
  const levelEl = levelRoot(container) as HTMLElement;
  const collected = new Set<string>();

  container.innerHTML = `
    <div class="collect-game">
      ${renderRiddleHeader(levelData)}
      <p class="game-prompt">${escapeHtml(cfg.prompt)}</p>
      <div class="collect-grid">
        ${cfg.items
          .map(
            (item) => `
          <button class="collect-item" data-id="${item.id}" data-ok="${item.permissionless}">
            <span class="collect-icon">${item.icon}</span>
            <span>${escapeHtml(item.label)}</span>
          </button>`
          )
          .join('')}
      </div>
      <div class="collect-status">Collected: <span id="collect-count">0</span> / ${cfg.requiredCount}</div>
    </div>
  `;

  const countEl = container.querySelector('#collect-count')!;

  container.querySelectorAll('.collect-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const el = btn as HTMLElement;
      if (el.classList.contains('collected')) return;

      const ok = el.dataset.ok === 'true';
      if (!ok) {
        showFeedback(levelEl, false, 'That one needs permission from someone else');
        el.classList.add('wrong-flash');
        setTimeout(() => el.classList.remove('wrong-flash'), 400);
        return;
      }

      el.classList.add('collected');
      collected.add(el.dataset.id!);
      countEl.textContent = String(collected.size);
      noteCorrect(levelEl);

      if (collected.size >= cfg.requiredCount) {
        showFeedback(levelEl, true);
        setTimeout(onComplete, 700);
      }
    });
  });
}

function mountAvoid(container: HTMLElement, onComplete: LevelCompleteCallback): void {
  const levelData = (window as unknown as { __currentLevel?: TweetLevel }).__currentLevel;
  if (!levelData || levelData.type !== 'avoid') return;
  const cfg = levelData.config as AvoidConfig;
  const levelEl = levelRoot(container) as HTMLElement;
  let score = 0;
  let misses = 0;
  let activeItem: HTMLElement | null = null;
  let timer: number | null = null;

  container.innerHTML = `
    <div class="avoid-game">
      ${renderRiddleHeader(levelData)}
      <p class="game-prompt">${escapeHtml(cfg.prompt)}</p>
      <div class="avoid-score">Score: <span id="avoid-score">0</span> / ${cfg.rounds}</div>
      <div class="avoid-arena" id="avoid-arena">
        <span class="arena-hint">Tap the good ones!</span>
      </div>
    </div>
  `;

  const arena = container.querySelector('#avoid-arena')!;
  const scoreEl = container.querySelector('#avoid-score')!;

  function spawn(): void {
    if (score >= cfg.rounds) return;
    if (activeItem) {
      activeItem.remove();
      activeItem = null;
    }

    const isGood = Math.random() > 0.35;
    const pool = isGood ? cfg.good : cfg.bad;
    const item = pool[Math.floor(Math.random() * pool.length)];

    const el = document.createElement('button');
    el.className = `avoid-item ${isGood ? 'good' : 'bad'}`;
    el.innerHTML = `<span>${item.icon}</span><span>${escapeHtml(item.label)}</span>`;
    el.style.left = `${10 + Math.random() * 70}%`;
    el.style.top = `${15 + Math.random() * 60}%`;

    el.addEventListener('click', () => {
      if (timer) clearTimeout(timer);
      if (isGood) {
        score++;
        scoreEl.textContent = String(score);
        el.classList.add('hit-good');
        noteCorrect(levelEl);
        if (score >= cfg.rounds) {
          showFeedback(levelEl, true);
          setTimeout(onComplete, 700);
          return;
        }
      } else {
        misses++;
        el.classList.add('hit-bad');
        showFeedback(levelEl, false, 'That was a trap!');
        if (misses >= 3) {
          score = 0;
          misses = 0;
          scoreEl.textContent = '0';
          showFeedback(levelEl, false, '3 misses — try again');
        }
      }
      setTimeout(() => {
        el.remove();
        activeItem = null;
        spawn();
      }, 300);
    });

    arena.querySelector('.arena-hint')?.remove();
    arena.appendChild(el);
    activeItem = el;

    timer = window.setTimeout(() => {
      if (activeItem === el) {
        if (isGood) {
          misses++;
          showFeedback(levelEl, false, 'Too slow!');
        }
        el.remove();
        activeItem = null;
        spawn();
      }
    }, 1800);
  }

  setTimeout(spawn, 500);
}
