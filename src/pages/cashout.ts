import { TOTAL_LEVELS } from '../data/tweets';
import { escapeHtml } from '../utils';
import { renderSlykDock } from '../components/ui';
import { renderTopNav } from '../components/nav';
import { renderWalletBar } from '../components/wallet-bar';
import { MeResponse } from '../slyk/session';

export function renderCashoutPage(me: MeResponse | null, progress: number): string {
  const symbol = me?.economy?.rewardSymbol ?? 'NAV';
  const ready = progress >= TOTAL_LEVELS;
  const signedIn = Boolean(me?.user);
  const navLabel = me?.navLabel ?? `0 ${symbol}`;

  return `
    <div class="screen screen--page">
      ${renderTopNav('play')}
      ${renderWalletBar(me)}
      <main class="page-main">
        <section class="page-section">
          <p class="page-kicker">Cash out</p>
          <h1 class="page-title">Convert ${escapeHtml(symbol)} → BTC</h1>
          <p class="page-lede">
            Slyk sets the live <strong>${escapeHtml(symbol)}/BTC</strong> rate. Step 1: convert NAV to BTC in your wallet.
            Step 2: withdraw BTC via <strong>Coinbase</strong> on naval.slyk.io.
          </p>
          <p class="how-note">Player wallet funding on Slyk is BTC-only. Patrons sponsor the game via Stripe on this site.</p>

          <div class="balance-chips">
            <span class="balance-chip">${escapeHtml(navLabel)}</span>
          </div>

          ${
            !signedIn
              ? `<button type="button" class="btn-primary" id="btn-auth-signup">Sign in to cash out</button>`
              : `
            <section class="how-card">
              <h2 class="how-card-title">Step 1 · Convert to BTC</h2>
              <form class="fund-form" id="exchange-form">
                <label class="field">
                  <span class="field-label">Amount (${escapeHtml(symbol)}, blank = all)</span>
                  <input class="field-input" name="amount" type="number" min="1" step="1" placeholder="All" />
                </label>
                <p class="field-error" id="exchange-error" hidden></p>
                <p class="page-lede page-lede--ok" id="exchange-ok" hidden></p>
                <button class="btn-secondary" type="submit">Convert to BTC</button>
              </form>
            </section>

            <section class="how-card">
              <h2 class="how-card-title">Step 2 · Withdraw BTC (Coinbase)</h2>
              ${
                ready
                  ? ''
                  : `<p class="how-note">Finish all ${TOTAL_LEVELS} levels to unlock withdrawal (progress: ${progress}).</p>`
              }
              <form class="fund-form" id="withdraw-form">
                <label class="field">
                  <span class="field-label">BTC amount (blank = all)</span>
                  <input class="field-input" name="amount" type="number" min="0" step="any" />
                </label>
                <label class="field">
                  <span class="field-label">BTC wallet address</span>
                  <input class="field-input" name="destination" type="text" required placeholder="Your Bitcoin address" />
                </label>
                <p class="field-error" id="withdraw-error" hidden></p>
                <p class="page-lede page-lede--ok" id="withdraw-ok" hidden></p>
                <button class="btn-primary" type="submit" ${ready ? '' : 'disabled'}>Withdraw via Coinbase</button>
              </form>
            </section>
          `
          }
        </section>
      </main>
      ${renderSlykDock()}
    </div>
  `;
}
