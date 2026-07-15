import { TOTAL_LEVELS } from '../data/tweets';
import { renderSlykDock } from '../components/ui';
import { renderTopNav } from '../components/nav';
import { renderHowFlowAnimation } from '../components/how-flow';

export function renderHowItWorksPage(_data: unknown, gameComplete: boolean): string {
  return `
    <div class="screen screen--page screen--wordle">
      ${renderTopNav('how')}
      <main class="wq-title" style="text-align:left">
        <p class="page-kicker">Help</p>
        <h1 class="wq-logo" style="text-align:left;font-size:1.75rem">How to play</h1>
        <p class="wq-tagline" style="margin-left:0;text-align:left">
          Naval Quest walks you through the
          <a href="https://twitter.com/naval/status/1002103360646823936" target="_blank" rel="noopener noreferrer">How to Get Rich</a>
          tweetstorm — ${TOTAL_LEVELS} levels, one tweet each.
        </p>

        ${renderHowFlowAnimation('NAV')}

        <ol class="page-list" style="margin-top:2rem">
          <li>Read Naval’s tweet and the podcast clip for that level.</li>
          <li>Solve the short puzzle. Hints and skips cost NAV.</li>
          <li>Sign up so level clears credit ${`NAV`} to your Slyk wallet.</li>
          <li>Patrons sponsor via Stripe. Players cash out BTC via Coinbase after level ${TOTAL_LEVELS}.</li>
        </ol>
        ${
          gameComplete
            ? '<p class="page-lede page-lede--ok">Quest complete — cash out is unlocked.</p>'
            : `<p class="how-note">Finish all ${TOTAL_LEVELS} levels to unlock withdrawal.</p>`
        }

        <div class="wq-secondary-actions" style="justify-content:flex-start;margin-top:2rem">
          <button class="wq-play" type="button" id="how-play">Play</button>
          <button class="wq-btn-outline" type="button" id="how-goto-sponsor">Sponsor</button>
          <button class="wq-btn-ghost" type="button" id="how-goto-videos">Videos</button>
          <button class="wq-btn-ghost" type="button" id="how-goto-home">Home</button>
        </div>
        <button type="button" id="how-goto-videos-2" hidden aria-hidden="true"></button>
      </main>
      ${renderSlykDock()}
    </div>
  `;
}
