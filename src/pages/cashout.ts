import { TOTAL_LEVELS } from '../data/tweets';
import { escapeHtml } from '../utils';
import { renderSlykDock } from '../components/ui';
import { renderTopNav } from '../components/nav';
import { renderWalletBar } from '../components/wallet-bar';
import { MeResponse } from '../slyk/session';

export function renderCashoutPage(me: MeResponse | null, progress: number): string {
  const symbol = me?.economy?.rewardSymbol ?? 'NAV';
  const targets = me?.economy?.cashoutTargets ?? [];
  const balances = me?.balances ?? [];
  const ready = progress >= TOTAL_LEVELS;
  const signedIn = Boolean(me?.user);

  return `
    <div class="screen screen--page">
      ${renderTopNav('play')}
      ${renderWalletBar(me)}
      <main class="page-main">
        <section class="page-section">
          <p class="page-kicker">Cash out</p>
          <h1 class="page-title">Convert NAV &amp; withdraw</h1>
          <p class="page-lede">
            1) Convert ${escapeHtml(symbol)} → USD, USDC, or BTC.<br />
            2) Withdraw via PayPal / Coinbase rails (pending admin settlement when manual).
          </p>

          <div class="balance-chips">
            ${
              balances.length
                ? balances
                    .map((b) => `<span class="balance-chip">${escapeHtml(b.label)}</span>`)
                    .join('')
                : `<span class="balance-chip">No balances yet</span>`
            }
          </div>

          ${
            !signedIn
              ? `<button type="button" class="btn-primary" id="btn-auth-signup">Sign in to cash out</button>`
              : `
            <section class="how-card">
              <h2 class="how-card-title">Step 1 · Convert ${escapeHtml(symbol)}</h2>
              <form class="fund-form" id="exchange-form">
                <label class="field">
                  <span class="field-label">Amount (${escapeHtml(symbol)})</span>
                  <input class="field-input" name="amount" type="number" min="1" step="1" placeholder="All" />
                </label>
                <label class="field">
                  <span class="field-label">To</span>
                  <select class="field-input" name="targetAsset">
                    ${targets.map((t) => `<option value="${escapeHtml(t.assetCode)}">${escapeHtml(t.label)}</option>`).join('')}
                  </select>
                </label>
                <p class="field-error" id="exchange-error" hidden></p>
                <p class="page-lede page-lede--ok" id="exchange-ok" hidden></p>
                <button class="btn-secondary" type="submit">Convert</button>
              </form>
            </section>

            <section class="how-card">
              <h2 class="how-card-title">Step 2 · Withdraw</h2>
              ${
                ready
                  ? ''
                  : `<p class="how-note">Finish all ${TOTAL_LEVELS} levels to unlock withdrawal (progress: ${progress}).</p>`
              }
              <form class="fund-form" id="withdraw-form">
                <label class="field">
                  <span class="field-label">Asset</span>
                  <select class="field-input" name="assetCode">
                    ${targets.map((t) => `<option value="${escapeHtml(t.assetCode)}">${escapeHtml(t.label)}</option>`).join('')}
                  </select>
                </label>
                <label class="field">
                  <span class="field-label">Amount (blank = all)</span>
                  <input class="field-input" name="amount" type="number" min="0" step="any" />
                </label>
                <label class="field">
                  <span class="field-label">Destination</span>
                  <input class="field-input" name="destination" type="text" required placeholder="PayPal email or crypto address" />
                </label>
                <p class="field-error" id="withdraw-error" hidden></p>
                <p class="page-lede page-lede--ok" id="withdraw-ok" hidden></p>
                <button class="btn-primary" type="submit" ${ready ? '' : 'disabled'}>Request withdrawal</button>
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
