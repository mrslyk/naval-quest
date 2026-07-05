import { TWEET_LEVELS_ALL, TOTAL_LEVELS, TweetLevel } from '../data/tweets';
import { renderNavalGuide, renderTweetCard, renderLevelHeader, renderSlykDock } from '../components/ui';
import { bindPodcastPlayer } from '../components/podcast-player';
import { renderHomeScreen, renderLevelRewardBlock, renderShopStrip } from '../components/home';
import { bindTopNav, renderTopNav } from '../components/nav';
import { renderAuthModal, renderWalletBar } from '../components/wallet-bar';
import { mountLevel } from '../levels/renderers';
import { loadProgress, saveProgress, resetProgress, escapeHtml } from '../utils';
import { notifyLevelComplete, notifyJourneyComplete, getLastReward } from '../slyk/bridge';
import { getSlykContext } from '../slyk/config';
import {
  fetchMe,
  MeResponse,
  signup,
  login,
  logout,
  deposit,
  spend,
  exchange,
  withdraw,
  clearMeCache,
} from '../slyk/session';
import { renderFundPage } from '../pages/fund';
import { renderHowItWorksPage } from '../pages/how-it-works';
import { renderCashoutPage } from '../pages/cashout';

type Screen = 'splash' | 'home' | 'fund' | 'how' | 'cashout' | 'level' | 'complete';

export class Game {
  private root: HTMLElement;
  private currentLevel = 0;
  private screen: Screen = 'splash';
  private phase: 'intro' | 'playing' | 'success' = 'intro';
  private me: MeResponse | null = null;
  private authMode: 'login' | 'signup' | null = null;
  private levelBoost: { hint?: string; reveal?: boolean } = {};

  constructor(root: HTMLElement) {
    this.root = root;
    this.currentLevel = loadProgress();
    if (this.currentLevel >= TOTAL_LEVELS) this.screen = 'complete';
    void this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    try {
      this.me = await fetchMe(true);
    } catch {
      this.me = null;
    }
    this.render();
  }

  private go(screen: Screen): void {
    this.screen = screen;
    this.authMode = null;
    this.render();
  }

  private async refreshMe(): Promise<void> {
    try {
      this.me = await fetchMe(true);
    } catch {
      /* keep */
    }
  }

  private bindNav(): void {
    bindTopNav(this.root, {
      onHome: () => this.go('home'),
      onFund: () => this.go('fund'),
      onHow: () => this.go('how'),
      onPlay: () => {
        this.screen = 'level';
        this.currentLevel = loadProgress();
        this.phase = 'intro';
        this.levelBoost = {};
        this.render();
      },
    });
    this.root.querySelector('#nav-cashout')?.addEventListener('click', () => this.go('cashout'));
    this.bindAuthChrome();
  }

  private bindAuthChrome(): void {
    this.root.querySelector('#btn-auth-login')?.addEventListener('click', () => {
      this.authMode = 'login';
      this.render();
    });
    this.root.querySelector('#btn-auth-signup')?.addEventListener('click', () => {
      this.authMode = 'signup';
      this.render();
    });
    this.root.querySelector('#btn-auth-logout')?.addEventListener('click', async () => {
      await logout();
      this.me = await fetchMe(true);
      this.render();
    });

    if (!this.authMode) return;

    this.root.querySelector('#auth-close')?.addEventListener('click', () => {
      this.authMode = null;
      this.render();
    });
    this.root.querySelector('#auth-switch-login')?.addEventListener('click', () => {
      this.authMode = 'login';
      this.render();
    });
    this.root.querySelector('#auth-switch-signup')?.addEventListener('click', () => {
      this.authMode = 'signup';
      this.render();
    });

    this.root.querySelector('#auth-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const fd = new FormData(form);
      const errEl = this.root.querySelector('#auth-error') as HTMLElement | null;
      try {
        const ctx = getSlykContext();
        if (this.authMode === 'signup') {
          this.me = await signup({
            name: String(fd.get('name') || ''),
            email: String(fd.get('email') || ''),
            password: String(fd.get('password') || ''),
            referral: ctx.referral,
          });
        } else {
          this.me = await login({
            email: String(fd.get('email') || ''),
            password: String(fd.get('password') || ''),
          });
        }
        this.authMode = null;
        this.render();
      } catch (err) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = err instanceof Error ? err.message : 'Auth failed';
        }
      }
    });
  }

  private withAuthModal(html: string): string {
    if (!this.authMode) return html;
    return `${html}${renderAuthModal(this.authMode)}`;
  }

  private render(): void {
    switch (this.screen) {
      case 'splash':
        this.renderSplash();
        break;
      case 'home':
        this.renderHome();
        break;
      case 'fund':
        this.renderFund();
        break;
      case 'how':
        this.renderHow();
        break;
      case 'cashout':
        this.renderCashout();
        break;
      case 'level':
        this.renderLevel();
        break;
      case 'complete':
        this.renderComplete();
        break;
    }
  }

  private renderSplash(): void {
    this.root.innerHTML = `
      <div class="screen screen--splash">
        <div class="splash-inner">
          <div class="splash-mark" aria-hidden="true">✦</div>
          <p class="splash-kicker">Slyk × Naval Ravikant</p>
          <h1 class="splash-title">Naval Quest</h1>
          <p class="splash-tagline">How to get rich<br /><em>without getting lucky</em></p>
          <p class="splash-lede">Earn NAV every level.<br />Fund with card or crypto. Cash out when you finish.</p>
          <button class="btn-primary splash-enter" id="btn-splash-enter" type="button">Enter</button>
        </div>
        ${renderSlykDock()}
      </div>
    `;
    this.root.querySelector('#btn-splash-enter')?.addEventListener('click', () => this.go('home'));
  }

  private renderHome(): void {
    this.root.innerHTML = this.withAuthModal(
      renderHomeScreen({ saved: loadProgress(), me: this.me, loading: false })
    );
    this.bindNav();
    this.root.querySelector('#btn-start')?.addEventListener('click', () => {
      this.screen = 'level';
      this.currentLevel = loadProgress();
      this.phase = 'intro';
      this.levelBoost = {};
      this.render();
    });
    this.root.querySelector('#btn-fund-home')?.addEventListener('click', () => this.go('fund'));
    this.root.querySelector('#btn-cashout-home')?.addEventListener('click', () => this.go('cashout'));
    this.root.querySelector('#btn-reset')?.addEventListener('click', () => {
      resetProgress();
      this.currentLevel = 0;
      this.renderHome();
    });
  }

  private renderFund(): void {
    this.root.innerHTML = this.withAuthModal(renderFundPage(this.me));
    this.bindNav();
    this.root.querySelector('#deposit-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target as HTMLFormElement);
      const err = this.root.querySelector('#deposit-error') as HTMLElement | null;
      const ok = this.root.querySelector('#deposit-ok') as HTMLElement | null;
      try {
        const result = await deposit(String(fd.get('railId')), String(fd.get('amount')));
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
          return;
        }
        if (ok) {
          ok.hidden = false;
          ok.textContent = result.message || 'Deposit submitted.';
        }
        if (err) err.hidden = true;
        await this.refreshMe();
      } catch (ex) {
        if (err) {
          err.hidden = false;
          err.textContent = ex instanceof Error ? ex.message : 'Deposit failed';
        }
      }
    });
  }

  private renderHow(): void {
    const gameComplete = loadProgress() >= TOTAL_LEVELS;
    this.root.innerHTML = this.withAuthModal(renderHowItWorksPage(null, gameComplete));
    this.bindNav();
    this.root.querySelector('#how-goto-fund')?.addEventListener('click', () => this.go('fund'));
    this.root.querySelector('#how-play')?.addEventListener('click', () => {
      this.screen = 'level';
      this.currentLevel = loadProgress();
      this.phase = 'intro';
      this.render();
    });
  }

  private renderCashout(): void {
    this.root.innerHTML = this.withAuthModal(renderCashoutPage(this.me, loadProgress()));
    this.bindNav();

    this.root.querySelector('#exchange-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target as HTMLFormElement);
      const err = this.root.querySelector('#exchange-error') as HTMLElement | null;
      const ok = this.root.querySelector('#exchange-ok') as HTMLElement | null;
      try {
        const amount = String(fd.get('amount') || '');
        const result = await exchange(String(fd.get('targetAsset')), amount || undefined);
        if (ok) {
          ok.hidden = false;
          ok.textContent = `Converted → ${result.receivedLabel}`;
        }
        if (err) err.hidden = true;
        await this.refreshMe();
        this.renderCashout();
      } catch (ex) {
        if (err) {
          err.hidden = false;
          err.textContent = ex instanceof Error ? ex.message : 'Convert failed';
        }
      }
    });

    this.root.querySelector('#withdraw-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target as HTMLFormElement);
      const err = this.root.querySelector('#withdraw-error') as HTMLElement | null;
      const ok = this.root.querySelector('#withdraw-ok') as HTMLElement | null;
      try {
        const amount = String(fd.get('amount') || '');
        const result = await withdraw({
          assetCode: String(fd.get('assetCode')),
          amount: amount || undefined,
          destination: String(fd.get('destination')),
        });
        if (ok) {
          ok.hidden = false;
          ok.textContent = result.message;
        }
        if (err) err.hidden = true;
        await this.refreshMe();
      } catch (ex) {
        if (err) {
          err.hidden = false;
          err.textContent = ex instanceof Error ? ex.message : 'Withdraw failed';
        }
      }
    });
  }

  private renderLevel(): void {
    const level = TWEET_LEVELS_ALL[this.currentLevel];
    if (!level) {
      this.screen = 'complete';
      this.render();
      return;
    }

    (window as unknown as { __currentLevel?: TweetLevel }).__currentLevel = level;
    const isIntro = this.phase === 'intro';
    const isSuccess = this.phase === 'success';

    const boostNote = this.levelBoost.reveal
      ? `<p class="boost-note">Answer revealed — tap through when ready.</p>`
      : this.levelBoost.hint
        ? `<p class="boost-note">Hint: ${escapeHtml(this.levelBoost.hint)}</p>`
        : '';

    this.root.innerHTML = this.withAuthModal(`
      <div class="screen screen--level phase--${this.phase}">
        ${renderLevelHeader(level, this.currentLevel, TOTAL_LEVELS)}
        ${renderWalletBar(this.me)}
        <article class="lesson lesson--open">
          ${renderTweetCard(level, TOTAL_LEVELS)}
          ${renderNavalGuide(level, this.phase)}
          ${boostNote}
        </article>
        ${this.phase === 'playing' ? renderShopStrip(this.me) : ''}
        <section class="playfield ${isIntro ? 'playfield--waiting' : ''}" data-level="${level.id}">
          <div class="playfield-inner" id="level-canvas"></div>
          ${
            isIntro
              ? '<button class="btn-primary btn-primary--soft" id="btn-begin" type="button">Play this level</button>'
              : ''
          }
        </section>
        ${renderSlykDock()}
      </div>
    `);

    this.bindAuthChrome();
    bindPodcastPlayer(this.root);
    this.root.querySelector('#btn-home')?.addEventListener('click', () => {
      saveProgress(this.currentLevel);
      this.go('home');
    });

    this.root.querySelectorAll('[data-shop]').forEach((el) => {
      el.addEventListener('click', () => {
        void this.buyHelp(el.getAttribute('data-shop') || '');
      });
    });

    if (isIntro) {
      this.root.querySelector('#btn-begin')?.addEventListener('click', () => {
        this.phase = 'playing';
        this.renderLevel();
        this.startChallenge();
      });
    } else if (!isSuccess) {
      this.startChallenge();
    }
  }

  private async buyHelp(itemId: string): Promise<void> {
    const level = TWEET_LEVELS_ALL[this.currentLevel];
    if (!this.me?.user) {
      this.authMode = 'signup';
      this.render();
      return;
    }
    try {
      const result = await spend(itemId, level?.id);
      clearMeCache();
      await this.refreshMe();

      if (result.effect === 'hint') {
        this.levelBoost.hint = level?.navalHint || 'Look for the pattern Naval describes.';
      } else if (result.effect === 'reveal') {
        this.levelBoost.reveal = true;
        this.levelBoost.hint = level?.navalSuccess || 'Follow the tweet.';
      } else if (result.effect === 'skip') {
        await this.onLevelComplete(true);
        return;
      }
      this.renderLevel();
      const bal = this.root.querySelector('#wallet-nav-balance');
      if (bal) bal.textContent = result.navLabel;
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Purchase failed');
    }
  }

  private startChallenge(): void {
    const level = TWEET_LEVELS_ALL[this.currentLevel];
    const canvas = this.root.querySelector('#level-canvas') as HTMLElement;
    if (!canvas || !level) return;

    if (this.levelBoost.reveal) {
      // Auto-complete after purchase reveal
      void this.onLevelComplete(true);
      return;
    }

    mountLevel(canvas, level, () => this.onLevelComplete(false));
  }

  private async onLevelComplete(fromShop: boolean): Promise<void> {
    const level = TWEET_LEVELS_ALL[this.currentLevel];
    this.phase = 'success';

    const reward = await notifyLevelComplete(level?.id ?? this.currentLevel + 1);
    await this.refreshMe();

    const whisperText = this.root.querySelector('.whisper-text');
    if (whisperText && level) {
      const whisper = this.root.querySelector('.whisper');
      whisper?.classList.replace('whisper--playing', 'whisper--success');
      whisper?.classList.replace('whisper--intro', 'whisper--success');
      whisperText.textContent = level.navalSuccess;
    }

    const playfield = this.root.querySelector('.playfield');
    playfield?.classList.remove('playfield--waiting');

    const canvas = this.root.querySelector('#level-canvas');
    if (canvas) {
      const sheet = document.createElement('div');
      sheet.className = 'sheet';
      sheet.innerHTML = `
        <div class="sheet-body">
          <p class="sheet-label">${fromShop ? 'Boost used' : 'Clear'}</p>
          ${renderLevelRewardBlock(reward)}
          <p class="sheet-text">${level?.navalSuccess ?? ''}</p>
          <div class="sheet-actions">
            <button class="btn-primary" id="btn-next" type="button">
              ${this.currentLevel + 1 >= TOTAL_LEVELS ? 'Finish' : 'Next tweet'}
            </button>
          </div>
        </div>
      `;
      canvas.appendChild(sheet);
      requestAnimationFrame(() => sheet.classList.add('sheet--visible'));

      sheet.querySelector('#btn-auth-signup')?.addEventListener('click', () => {
        this.authMode = 'signup';
        this.render();
      });

      sheet.querySelector('#btn-next')?.addEventListener('click', async () => {
        this.currentLevel++;
        this.levelBoost = {};
        saveProgress(this.currentLevel);
        if (this.currentLevel >= TOTAL_LEVELS) {
          await notifyJourneyComplete(level?.id ?? TOTAL_LEVELS);
          this.screen = 'complete';
        } else {
          this.phase = 'intro';
          this.screen = 'level';
        }
        this.render();
      });
    }
  }

  private renderComplete(): void {
    const reward = getLastReward();
    this.root.innerHTML = this.withAuthModal(`
      <div class="screen screen--complete">
        ${renderTopNav('play')}
        ${renderWalletBar(this.me)}
        <div class="hero hero--end">
          <p class="kicker">Journey complete</p>
          <blockquote class="end-quote">
            Apply specific knowledge, with leverage, and eventually you will get what you deserve.
          </blockquote>
          <p class="end-cite">Tweet 38 · Naval Ravikant</p>
          ${renderLevelRewardBlock(reward)}
          <p class="lede lede--dim">Your NAV balance is ready. Convert to fiat or crypto and withdraw.</p>
          <div class="actions">
            <button class="btn-primary" id="btn-cashout-final" type="button">Cash out</button>
            <button class="btn-text" id="btn-home-final" type="button">Home</button>
          </div>
        </div>
        ${renderSlykDock({ highlight: true })}
      </div>
    `);
    this.bindNav();
    this.root.querySelector('#btn-cashout-final')?.addEventListener('click', () => this.go('cashout'));
    this.root.querySelector('#btn-home-final')?.addEventListener('click', () => this.go('home'));
  }
}
