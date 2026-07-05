import { escapeHtml } from '../utils';
import { renderSlykDock } from '../components/ui';
import { renderTopNav } from '../components/nav';
import { renderWalletBar } from '../components/wallet-bar';
import { MeResponse } from '../slyk/session';

export function renderFundPage(me: MeResponse | null, message: string | null = null): string {
  const rails = me?.economy?.fundRails ?? [];
  const symbol = me?.economy?.rewardSymbol ?? 'NAV';
  const signedIn = Boolean(me?.user);

  return `
    <div class="screen screen--page">
      ${renderTopNav('fund')}
      ${renderWalletBar(me)}
      <main class="page-main">
        <section class="page-section">
          <p class="page-kicker">Add funds</p>
          <h1 class="page-title">Fuel the prize pool</h1>
          <p class="page-lede">
            Deposit fiat (Stripe, PayPal) or crypto (Coinbase). Funds support rewards —
            players earn <strong>${escapeHtml(symbol)}</strong> for every level they clear.
          </p>

          ${
            !signedIn
              ? `<p class="field-error">Sign in first so deposits credit your wallet.</p>
                 <button type="button" class="btn-primary" id="btn-auth-signup">Sign up to fund</button>`
              : `
            <form class="fund-form" id="deposit-form">
              <label class="field">
                <span class="field-label">Amount</span>
                <input class="field-input" name="amount" type="number" min="1" step="1" value="25" required />
              </label>
              <p class="field-label">Payment method</p>
              <div class="pay-grid">
                ${rails
                  .map(
                    (r) => `
                  <label class="pay-card pay-card--radio">
                    <input type="radio" name="railId" value="${escapeHtml(r.id)}" ${r.id === 'stripe' ? 'checked' : ''} />
                    <span class="pay-card-name">${escapeHtml(r.name)}</span>
                    <span class="pay-card-assets">${escapeHtml(r.kind)} · ${escapeHtml(r.assetCode.toUpperCase())}</span>
                  </label>`
                  )
                  .join('')}
              </div>
              <p class="field-error" id="deposit-error" hidden></p>
              <p class="page-lede page-lede--ok" id="deposit-ok" hidden></p>
              <button class="btn-primary" type="submit">Deposit</button>
            </form>
            ${message ? `<p class="page-lede page-lede--ok">${escapeHtml(message)}</p>` : ''}
            <p class="how-note">Live checkout requires Stripe, PayPal, and Coinbase connected in the Naval Slyk dashboard. Until then, deposits may stay pending for admin confirmation.</p>
          `
          }
        </section>
      </main>
      ${renderSlykDock()}
    </div>
  `;
}
