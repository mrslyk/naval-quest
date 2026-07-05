import { TOTAL_LEVELS } from '../data/tweets';
import { renderSlykDock } from '../components/ui';
import { renderTopNav } from '../components/nav';

export function renderHowItWorksPage(_data: unknown, gameComplete: boolean): string {
  return `
    <div class="screen screen--page">
      ${renderTopNav('how')}
      <main class="page-main">
        <section class="page-section page-section--wide">
          <p class="page-kicker">How it works</p>
          <h1 class="page-title">Fund · Play · Earn NAV · Cash out</h1>
          <p class="page-lede">
            Naval Quest runs on the Naval Slyk ledger. One account, one wallet,
            balances in NAV plus fiat and crypto.
          </p>

          <div class="how-grid">
            <article class="how-card">
              <h2 class="how-card-title">1 · Add funds</h2>
              <p>Deposit with <strong>Stripe</strong> (card), <strong>PayPal</strong>, or <strong>Coinbase</strong> (crypto). Money supports the reward pool.</p>
              <button class="btn-text btn-text--link" type="button" id="how-goto-fund">Add funds →</button>
            </article>

            <article class="how-card">
              <h2 class="how-card-title">2 · Earn NAV</h2>
              <p>Sign up in the game. Clear each of ${TOTAL_LEVELS} levels to earn <strong>NAV</strong> via Slyk tasks. Invite friends — you earn a % of what they earn.</p>
            </article>

            <article class="how-card">
              <h2 class="how-card-title">3 · Spend NAV</h2>
              <p>Buy hints, reveals, or level skips with NAV during play. Spends return NAV to the master wallet.</p>
            </article>

            <article class="how-card">
              <h2 class="how-card-title">4 · Convert &amp; withdraw</h2>
              <p>After level ${TOTAL_LEVELS}, convert NAV → USD / USDC / BTC, then withdraw via PayPal or Coinbase rails.</p>
              ${
                gameComplete
                  ? '<p class="page-lede page-lede--ok">Quest complete — cash out is unlocked.</p>'
                  : `<p class="how-note">Finish all ${TOTAL_LEVELS} levels to unlock withdrawal.</p>`
              }
            </article>
          </div>

          <div class="how-cta">
            <button class="btn-primary" type="button" id="how-play">Play Naval Quest</button>
          </div>
        </section>
      </main>
      ${renderSlykDock()}
    </div>
  `;
}
