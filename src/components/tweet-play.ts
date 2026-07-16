import { TweetLevel } from '../data/tweets';
import { escapeHtml } from '../utils';
import { tweetPhrases, CORRECT_STEP_EVENT } from '../utils/tweet-phrases';
import { getNavalRichLevel } from '../data/naval-rich';

export function getLevelTweetText(level: TweetLevel): string {
  return getNavalRichLevel(level.id)?.tweet ?? level.tweet;
}

/** Sticky marquee + phrase tiles that unlock as you play correctly. */
export function renderTweetPlayChrome(level: TweetLevel, opts: { phase: 'playing' | 'success' }): string {
  const tweet = getLevelTweetText(level);
  const phrases = tweetPhrases(tweet);
  const allOn = opts.phase === 'success';

  return `
    <div class="tweet-play" data-phrase-count="${phrases.length}">
      <div class="tweet-marquee" aria-hidden="true">
        <div class="tweet-marquee-track">
          <span>${escapeHtml(tweet)}</span>
          <span aria-hidden="true">${escapeHtml(tweet)}</span>
        </div>
      </div>

      <div class="tweet-play-head">
        <span class="tweet-play-kicker">Tweet ${level.id} · Build the lesson</span>
        <span class="tweet-play-title">${escapeHtml(level.title)}</span>
      </div>

      <p class="tweet-play-instruction">
        Each correct move reveals the next phrase of Naval’s tweet.
      </p>

      <div class="tweet-phrases" id="tweet-phrases" role="list" aria-label="Tweet phrases">
        ${phrases
          .map(
            (p, i) => `
          <div class="tweet-phrase${allOn ? ' tweet-phrase--on' : ''}" role="listitem" data-phrase-index="${i}" aria-hidden="${allOn ? 'false' : 'true'}">
            <span class="tweet-phrase-index">${i + 1}</span>
            <span class="tweet-phrase-text">${escapeHtml(p)}</span>
          </div>`
          )
          .join('')}
      </div>
    </div>
  `;
}

export function bindTweetPhraseProgress(root: ParentNode): {
  unlockOne: () => void;
  unlockAll: () => void;
  dispose: () => void;
} {
  const rail = root.querySelector('#tweet-phrases');
  const tiles = rail ? Array.from(rail.querySelectorAll('.tweet-phrase')) : [];
  let next = tiles.findIndex((t) => !t.classList.contains('tweet-phrase--on'));
  if (next < 0) next = tiles.length;

  const reveal = (el: Element) => {
    el.classList.add('tweet-phrase--on', 'tweet-phrase--pop');
    el.setAttribute('aria-hidden', 'false');
    setTimeout(() => el.classList.remove('tweet-phrase--pop'), 500);
  };

  const unlockOne = () => {
    if (next >= tiles.length) return;
    reveal(tiles[next]);
    next += 1;
  };

  const unlockAll = () => {
    tiles.forEach((t) => reveal(t));
    next = tiles.length;
  };

  const onStep = () => unlockOne();
  const onAll = () => unlockAll();

  root.addEventListener(CORRECT_STEP_EVENT, onStep as EventListener);
  root.addEventListener('naval-unlock-all-phrases', onAll as EventListener);

  return {
    unlockOne,
    unlockAll,
    dispose: () => {
      root.removeEventListener(CORRECT_STEP_EVENT, onStep as EventListener);
      root.removeEventListener('naval-unlock-all-phrases', onAll as EventListener);
    },
  };
}
