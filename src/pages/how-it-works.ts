import { TOTAL_LEVELS } from '../data/tweets';
import { renderSlykDock } from '../components/ui';
import { renderTopNav } from '../components/nav';
import { renderPodcastPlatforms, renderTopVideosGrid, renderBooksRow } from '../components/media-hub';

export function renderHowItWorksPage(_data: unknown, gameComplete: boolean): string {
  return `
    <div class="screen screen--page">
      ${renderTopNav('how')}
      <main class="page-main">
        <section class="page-section page-section--wide">
          <p class="page-kicker">How it works</p>
          <h1 class="page-title">Learn Naval’s framework. Play the tweets. Earn NAV.</h1>
          <p class="page-lede">
            Naval Quest is an interactive walkthrough of the
            <a href="https://twitter.com/naval/status/1002103360646823936" target="_blank" rel="noopener noreferrer">How to Get Rich</a>
            tweetstorm — paired with clips and quotes from
            <a href="https://nav.al/rich" target="_blank" rel="noopener noreferrer">nav.al/rich</a>
            and the full podcast on YouTube, Apple, and Spotify.
          </p>

          <div class="how-overview">
            <article class="how-overview-card">
              <span class="how-overview-num">01</span>
              <h2>Study the source material</h2>
              <p>Each of ${TOTAL_LEVELS} levels features one tweet from Naval’s thread, expanded with podcast quotes and a link to the matching chapter on nav.al/rich.</p>
            </article>
            <article class="how-overview-card">
              <span class="how-overview-num">02</span>
              <h2>Play the level</h2>
              <p>Short puzzles and riddles reinforce the idea — wealth, leverage, specific knowledge, productize yourself. Hints and skips cost NAV.</p>
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

          <div class="how-grid">
            <article class="how-card">
              <h2 class="how-card-title">Sponsor the quest</h2>
              <p>Patrons pay via <strong>Stripe Checkout</strong> (all enabled payment methods). Funds back the NAV prize pool.</p>
              <button class="btn-text btn-text--link" type="button" id="how-goto-sponsor">Sponsor →</button>
            </article>

            <article class="how-card">
              <h2 class="how-card-title">Earn NAV</h2>
              <p>Clear each level to earn <strong>NAV</strong> via Slyk tasks. One wallet, balances in NAV plus fiat and crypto.</p>
            </article>

            <article class="how-card">
              <h2 class="how-card-title">Spend NAV</h2>
              <p>Buy hints (5 NAV), reveals (15), or skips (25) during play.</p>
            </article>

            <article class="how-card">
              <h2 class="how-card-title">Convert &amp; withdraw</h2>
              <p>Slyk sets the live <strong>NAV/BTC</strong> rate. Convert, then withdraw BTC via Coinbase on naval.slyk.io.</p>
            </article>
          </div>

          <div class="how-media-block">
            ${renderPodcastPlatforms()}
            ${renderTopVideosGrid({ compact: true })}
            ${renderBooksRow()}
          </div>

          <div class="how-cta">
            <button class="btn-primary" type="button" id="how-play">Play Naval Quest</button>
            <button class="btn-text" type="button" id="how-goto-home">Back to landing →</button>
          </div>
        </section>
      </main>
      ${renderSlykDock()}
    </div>
  `;
}
