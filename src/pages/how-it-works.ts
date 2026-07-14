import { TOTAL_LEVELS } from '../data/tweets';
import { renderSlykDock } from '../components/ui';
import { renderTopNav } from '../components/nav';
import { renderHowFlowAnimation } from '../components/how-flow';

export function renderHowItWorksPage(_data: unknown, gameComplete: boolean): string {
  return `
    <div class="screen screen--page">
      ${renderTopNav('how')}
      <main class="page-main page-main--wide">
        <section class="page-section page-section--wide">
          <p class="page-kicker">How it works</p>
          <h1 class="page-title">Learn Naval’s framework. Play the tweets. Earn NAV.</h1>
          <p class="page-lede">
            Naval Quest is an interactive walkthrough of the
            <a href="https://twitter.com/naval/status/1002103360646823936" target="_blank" rel="noopener noreferrer">How to Get Rich</a>
            tweetstorm — paired with clips from the full podcast on the
            <button type="button" class="btn-text btn-text--link" id="how-goto-videos">Videos</button> page.
          </p>

          ${renderHowFlowAnimation('NAV')}

          <div class="how-overview">
            <article class="how-overview-card">
              <span class="how-overview-num">01</span>
              <h2>Read the tweet</h2>
              <p>Each of ${TOTAL_LEVELS} levels opens with one tweet from Naval’s thread, plus a podcast quote from nav.al/rich.</p>
            </article>
            <article class="how-overview-card">
              <span class="how-overview-num">02</span>
              <h2>Play the puzzle</h2>
              <p>Short interactive challenges reinforce the idea — sort, match, choose, path-find. Hints and skips cost NAV.</p>
            </article>
            <article class="how-overview-card">
              <span class="how-overview-num">03</span>
              <h2>Earn NAV on Slyk</h2>
              <p>Sign up in-game. Completing a level triggers a Slyk task reward. Invite friends — you earn a cut of what they earn.</p>
            </article>
            <article class="how-overview-card">
              <span class="how-overview-num">04</span>
              <h2>Sponsor &amp; cash out</h2>
              <p>Patrons fund via Stripe on this site. Players cash out <strong>BTC via Coinbase</strong> on Slyk after level ${TOTAL_LEVELS}.</p>
              ${
                gameComplete
                  ? '<p class="page-lede page-lede--ok">Quest complete — cash out is unlocked.</p>'
                  : `<p class="how-note">Finish all ${TOTAL_LEVELS} levels to unlock withdrawal.</p>`
              }
            </article>
          </div>

          <div class="how-cta">
            <button class="btn-primary btn-primary--lg" type="button" id="how-play">Play Naval Quest</button>
            <button class="btn-secondary" type="button" id="how-goto-videos-2">Watch Naval videos</button>
            <button class="btn-text" type="button" id="how-goto-home">Back home →</button>
          </div>
        </section>
      </main>
      ${renderSlykDock()}
    </div>
  `;
}
