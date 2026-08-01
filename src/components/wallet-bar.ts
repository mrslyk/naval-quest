import { escapeHtml } from '../utils';
import { MeResponse } from '../slyk/session';

export function renderWalletBar(me: MeResponse | null): string {
  const user = me?.user;
  const navLabel = me?.navLabel ?? `0 ${me?.economy?.rewardSymbol ?? 'NAV'}`;

  if (!user) {
    return `
      <div class="wallet-bar">
        <span class="wallet-bar-muted">Account required to play &amp; earn NAV</span>
        <div class="wallet-bar-actions">
          <button type="button" class="btn-text" id="btn-auth-login">Log in</button>
          <button type="button" class="btn-secondary btn-secondary--sm" id="btn-auth-signup">Sign up</button>
        </div>
      </div>
    `;
  }

  return `
    <div class="wallet-bar">
      <div class="wallet-bar-user">
        <span class="wallet-bar-name">${escapeHtml(user.name || user.email)}</span>
        <span class="wallet-bar-bal" id="wallet-nav-balance">${escapeHtml(navLabel)}</span>
      </div>
      <div class="wallet-bar-actions">
        <button type="button" class="btn-text" id="nav-cashout">Cash out</button>
        <button type="button" class="btn-text" id="btn-auth-logout">Log out</button>
      </div>
    </div>
  `;
}

export function renderAuthModal(
  mode: 'login' | 'signup',
  opts: { reason?: string } = {}
): string {
  const isSignup = mode === 'signup';
  const reason =
    opts.reason ||
    (isSignup
      ? 'Free account required to play. You’ll earn NAV to your Slyk wallet for every level you clear.'
      : 'Log in to continue playing and keep your NAV rewards.');

  return `
    <div class="modal-backdrop" id="auth-modal">
      <div class="modal" role="dialog" aria-labelledby="auth-title" aria-modal="true">
        <button type="button" class="modal-close" id="auth-close" aria-label="Close">×</button>
        <p class="modal-kicker">${isSignup ? 'Required to play' : 'Welcome back'}</p>
        <h2 class="modal-title" id="auth-title">${isSignup ? 'Create your account' : 'Log in to play'}</h2>
        <p class="modal-lede">${escapeHtml(reason)}</p>
        <form class="fund-form" id="auth-form">
          ${
            isSignup
              ? `<label class="field"><span class="field-label">Name</span>
                 <input class="field-input" name="name" type="text" autocomplete="name" required /></label>`
              : ''
          }
          <label class="field">
            <span class="field-label">Email</span>
            <input class="field-input" name="email" type="email" autocomplete="email" required />
          </label>
          <label class="field">
            <span class="field-label">Password</span>
            <input class="field-input" name="password" type="password" autocomplete="${isSignup ? 'new-password' : 'current-password'}" required minlength="6" />
          </label>
          <p class="field-error" id="auth-error" hidden></p>
          <button class="btn-primary" type="submit">${isSignup ? 'Sign up & play' : 'Log in & play'}</button>
        </form>
        <p class="modal-switch">
          ${
            isSignup
              ? `Have an account? <button type="button" class="btn-text btn-text--link" id="auth-switch-login">Log in</button>`
              : `New here? <button type="button" class="btn-text btn-text--link" id="auth-switch-signup">Sign up free</button>`
          }
        </p>
      </div>
    </div>
  `;
}
