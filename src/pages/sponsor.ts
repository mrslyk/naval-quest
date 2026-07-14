import { escapeHtml } from '../utils';
import { renderSlykDock } from '../components/ui';
import { renderTopNav } from '../components/nav';

export interface SponsorTier {
  id: string;
  label: string;
  amountUsd: number;
}

export function renderSponsorPage(opts: {
  tiers: SponsorTier[];
  message?: string | null;
  error?: string | null;
}): string {
  const { tiers, message, error } = opts;

  return `
    <div class="screen screen--page">
      ${renderTopNav('sponsor')}
      <main class="page-main">
        <section class="page-section">
          <p class="page-kicker">Sponsor Naval Quest</p>
          <h1 class="page-title">Fund the prize pool</h1>
          <p class="page-lede">
            Help more people learn Naval’s wealth-creation framework — and get rewarded with
            <strong>NAV</strong> as they play. Your sponsorship lands in our Stripe balance and
            backs player earnings. Withdrawals for players are <strong>BTC via Coinbase</strong> on Slyk.
          </p>

          ${message ? `<p class="page-lede page-lede--ok">${escapeHtml(message)}</p>` : ''}
          ${error ? `<p class="field-error">${escapeHtml(error)}</p>` : ''}

          <form class="fund-form sponsor-form" id="sponsor-form">
            <label class="field">
              <span class="field-label">Your name (optional)</span>
              <input class="field-input" name="sponsorName" type="text" maxlength="120" placeholder="Anonymous patron" />
            </label>
            <label class="field">
              <span class="field-label">Message (optional)</span>
              <textarea class="field-input field-textarea" name="sponsorMessage" rows="3" maxlength="500" placeholder="Why you're supporting Naval Quest…"></textarea>
            </label>

            <p class="field-label">Choose an amount</p>
            <div class="sponsor-tiers">
              ${tiers
                .map(
                  (t, i) => `
                <label class="sponsor-tier">
                  <input type="radio" name="tierId" value="${escapeHtml(t.id)}" ${i === 1 ? 'checked' : ''} />
                  <span class="sponsor-tier-label">${escapeHtml(t.label)}</span>
                  <span class="sponsor-tier-amount">$${t.amountUsd.toLocaleString()}</span>
                </label>`
                )
                .join('')}
              <label class="sponsor-tier sponsor-tier--custom">
                <input type="radio" name="tierId" value="custom" />
                <span class="sponsor-tier-label">Other</span>
                <input class="field-input sponsor-custom-input" name="customAmount" type="number" min="10" step="1" placeholder="USD" />
              </label>
            </div>

            <p class="field-error" id="sponsor-error" hidden></p>
            <button class="btn-primary btn-primary--lg" type="submit">Continue to secure checkout →</button>
            <p class="how-note">Stripe Checkout — cards, Apple Pay, Google Pay, Link, bank transfer, and all methods enabled in your Stripe dashboard.</p>
          </form>
        </section>
      </main>
      ${renderSlykDock()}
    </div>
  `;
}
