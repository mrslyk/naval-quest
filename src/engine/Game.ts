import { TWEET_LEVELS_ALL, TOTAL_LEVELS, TweetLevel } from '../data/tweets';
import { renderNavalGuide, renderTweetCard, renderLevelHeader, renderSlykDock } from '../components/ui';
import { renderTweetPlayChrome, bindTweetPhraseProgress } from '../components/tweet-play';
import { signalUnlockAll } from '../utils/tweet-phrases';
import { bindPodcastPlayer } from '../components/podcast-player';
import { bindMediaHub } from '../components/media-hub';
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
  spend,
  exchange,
  withdraw,
  clearMeCache,
  fetchGameStats,
  createSponsorCheckout,
  fetchServerProgress,
  rollNavalBonus,
  scoreNavalBonus,
  GameStats,
} from '../slyk/session';
import { renderSponsorPage } from '../pages/sponsor';
import { renderHowItWorksPage } from '../pages/how-it-works';
import { renderCashoutPage } from '../pages/cashout';
import { renderVideosPage } from '../pages/videos';
import { renderStatsBoard, renderSponsorThanks } from '../components/stats-board';
import { renderNavalBonusModal } from '../components/naval-bonus';
import { toastError, toastInfo, toastSuccess, toastWarn } from '../components/toast';
import { applyDifficulty, difficultyLabel } from './difficulty';
import {
  AUTH_CASHOUT_REASON,
  AUTH_PLAY_REASON,
  tipForLevelType,
} from './play-tips';

type Screen = 'home' | 'sponsor' | 'how' | 'videos' | 'cashout' | 'level' | 'complete';
type PendingAfterAuth =
  | null
  | { kind: 'play' }
  | { kind: 'level'; index: number }
  | { kind: 'cashout' };

export class Game {
  private root: HTMLElement;
  private currentLevel = 0;
  private screen: Screen = 'home';
  private phase: 'intro' | 'playing' | 'success' = 'intro';
  private me: MeResponse | null = null;
  private authMode: 'login' | 'signup' | null = null;
  private authReason: string | null = null;
  private pendingAfterAuth: PendingAfterAuth = null;
  private levelBoost: { hint?: string; reveal?: boolean } = {};
  private gameStats: GameStats | null = null;
  private statsLoading = true;
  private sponsorBanner: string | null = null;
  private shopTipShown = false;
  private guidedTipKey: string | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    this.currentLevel = loadProgress();
    if (this.currentLevel >= TOTAL_LEVELS) this.screen = 'complete';
    const params = new URLSearchParams(window.location.search);
    if (params.get('sponsor') === 'thanks') {
      this.sponsorBanner = 'thanks';
      window.history.replaceState({}, '', window.location.pathname);
    }
    void this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    try {
      this.me = await fetchMe(true);
    } catch {
      this.me = null;
    }
    try {
      const server = await fetchServerProgress();
      if (server.levelsCleared > this.currentLevel) {
        this.currentLevel = server.levelsCleared;
        saveProgress(this.currentLevel);
      }
    } catch {
      /* optional */
    }
    void this.loadStats();
    this.render();
  }

  private async loadStats(): Promise<void> {
    this.statsLoading = true;
    try {
      this.gameStats = await fetchGameStats();
    } catch {
      this.gameStats = null;
    }
    this.statsLoading = false;
    if (this.screen === 'home') this.renderHome();
  }

  private go(screen: Screen): void {
    this.screen = screen;
    this.authMode = null;
    this.authReason = null;
    this.render();
  }

  private isSignedIn(): boolean {
    return Boolean(this.me?.user);
  }

  private requireAuth(
    reason: string,
    pending: PendingAfterAuth = { kind: 'play' },
    mode: 'login' | 'signup' = 'signup'
  ): boolean {
    if (this.isSignedIn()) return true;
    this.pendingAfterAuth = pending;
    this.authReason = reason;
    this.authMode = mode;
    toastWarn(reason, 4200);
    this.render();
    return false;
  }

  private startPlayAt(index?: number): void {
    if (!this.isSignedIn()) {
      this.requireAuth(
        AUTH_PLAY_REASON,
        index != null ? { kind: 'level', index } : { kind: 'play' }
      );
      return;
    }
    this.screen = 'level';
    this.currentLevel = index ?? loadProgress();
    this.phase = 'intro';
    this.levelBoost = {};
    this.shopTipShown = false;
    this.guidedTipKey = null;
    toastInfo(
      this.currentLevel > 0
        ? `Welcome back — resume at tweet ${Math.min(this.currentLevel + 1, TOTAL_LEVELS)}.`
        : 'You’re in. Read Naval’s tweet, then tap Play this level.',
      3200
    );
    this.render();
  }

  private guideOnce(
    key: string,
    message: string,
    ms = 3400,
    kind: 'info' | 'success' | 'warn' = 'info'
  ): void {
    if (this.guidedTipKey === key) return;
    this.guidedTipKey = key;
    if (kind === 'success') toastSuccess(message, ms);
    else if (kind === 'warn') toastWarn(message, ms);
    else toastInfo(message, ms);
  }

  private resumePendingAfterAuth(): void {
    const pending = this.pendingAfterAuth;
    this.pendingAfterAuth = null;
    if (!pending) {
      this.render();
      return;
    }
    if (pending.kind === 'cashout') {
      this.go('cashout');
      toastInfo('You’re signed in. Convert NAV → BTC when you’re ready.', 3200);
      return;
    }
    if (pending.kind === 'level') {
      this.startPlayAt(pending.index);
      return;
    }
    this.startPlayAt();
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
      onPlay: () => {
        if (!this.requireAuth(AUTH_PLAY_REASON, { kind: 'play' })) return;
        this.startPlayAt();
      },
      onVideos: () => this.go('videos'),
      onSponsor: () => this.go('sponsor'),
      onHow: () => this.go('how'),
    });
    this.root.querySelector('#nav-cashout')?.addEventListener('click', () => {
      if (!this.requireAuth(AUTH_CASHOUT_REASON, { kind: 'cashout' })) return;
      this.go('cashout');
    });
    this.bindAuthChrome();
  }

  private bindAuthChrome(): void {
    this.root.querySelector('#btn-auth-login')?.addEventListener('click', () => {
      this.authMode = 'login';
      this.authReason = this.authReason || 'Log in to continue playing and keep your NAV rewards.';
      this.render();
    });
    this.root.querySelector('#btn-auth-signup')?.addEventListener('click', () => {
      this.authMode = 'signup';
      this.authReason = this.authReason || AUTH_PLAY_REASON;
      if (!this.pendingAfterAuth && this.screen === 'home') {
        this.pendingAfterAuth = { kind: 'play' };
      }
      this.render();
    });
    this.root.querySelector('#btn-auth-logout')?.addEventListener('click', async () => {
      await logout();
      this.me = await fetchMe(true);
      this.pendingAfterAuth = null;
      toastInfo('Signed out. Sign in again whenever you’re ready to play.', 2800);
      this.go('home');
    });

    if (!this.authMode) return;

    this.root.querySelector('#auth-close')?.addEventListener('click', () => {
      this.authMode = null;
      this.authReason = null;
      this.pendingAfterAuth = null;
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
      const submit = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
      if (submit) {
        submit.disabled = true;
        submit.textContent = this.authMode === 'signup' ? 'Creating account…' : 'Signing in…';
      }
      try {
        const ctx = getSlykContext();
        const wasSignup = this.authMode === 'signup';
        if (wasSignup) {
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
        this.authReason = null;
        toastSuccess(
          wasSignup
            ? 'Account ready — let’s play. Clear levels to earn NAV.'
            : `Welcome back${this.me?.user?.name ? `, ${this.me.user.name}` : ''}.`,
          3600
        );
        this.resumePendingAfterAuth();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Auth failed';
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = msg;
        }
        toastError(msg);
        if (submit) {
          submit.disabled = false;
          submit.textContent = this.authMode === 'signup' ? 'Sign up & play' : 'Log in & play';
        }
      }
    });
  }

  private withAuthModal(html: string): string {
    if (!this.authMode) return html;
    return `${html}${renderAuthModal(this.authMode, { reason: this.authReason ?? undefined })}`;
  }

  private render(): void {
    switch (this.screen) {
      case 'home':
        this.renderHome();
        break;
      case 'sponsor':
        this.renderSponsor();
        break;
      case 'how':
        this.renderHow();
        break;
      case 'videos':
        this.renderVideos();
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

  private renderHome(): void {
    this.root.innerHTML = this.withAuthModal(
      renderHomeScreen({
        saved: loadProgress(),
        me: this.me,
        loading: false,
        statsHtml: renderStatsBoard(this.gameStats, this.statsLoading),
        sponsorThanks: this.sponsorBanner === 'thanks' ? renderSponsorThanks() : '',
      })
    );
    if (this.sponsorBanner === 'thanks') {
      toastSuccess('Sponsorship received — thank you for fueling the prize pool.', 4000);
    }
    this.sponsorBanner = null;
    this.bindNav();
    const startPlay = () => {
      if (!this.requireAuth(AUTH_PLAY_REASON, { kind: 'play' })) return;
      this.startPlayAt();
    };
    this.root.querySelector('#btn-start')?.addEventListener('click', startPlay);
    this.root.querySelector('#btn-start-2')?.addEventListener('click', startPlay);
    this.root.querySelector('#btn-sponsor-home')?.addEventListener('click', () => this.go('sponsor'));
    this.root.querySelector('#btn-sponsor-hero')?.addEventListener('click', () => this.go('sponsor'));
    this.root.querySelector('#btn-cashout-home')?.addEventListener('click', () => {
      if (!this.requireAuth(AUTH_CASHOUT_REASON, { kind: 'cashout' })) return;
      this.go('cashout');
    });
    this.root.querySelector('#btn-videos-home')?.addEventListener('click', () => this.go('videos'));
    this.root.querySelector('#btn-reset')?.addEventListener('click', () => {
      if (!this.isSignedIn()) {
        toastWarn('Sign in first — then you can reset your local progress.', 3200);
        return;
      }
      resetProgress();
      this.currentLevel = 0;
      toastInfo('Progress reset. Start again from tweet 1.', 2800);
      this.renderHome();
    });
    this.root.querySelectorAll('.lg-row:not(.lg-row--locked)').forEach((row) => {
      const goLevel = () => {
        const idx = Number((row as HTMLElement).dataset.levelIndex);
        if (Number.isNaN(idx)) return;
        if (!this.requireAuth(AUTH_PLAY_REASON, { kind: 'level', index: idx })) return;
        this.startPlayAt(idx);
      };
      row.addEventListener('click', goLevel);
      row.addEventListener('keydown', (e) => {
        if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
          e.preventDefault();
          goLevel();
        }
      });
    });
    this.root.querySelectorAll('.lg-row--locked').forEach((row) => {
      row.addEventListener('click', () => {
        toastInfo(
          this.isSignedIn()
            ? 'Clear the previous tweets first — levels unlock in order.'
            : 'Sign up to play. Levels unlock in order as you clear them.',
          3200
        );
      });
    });
  }

  private renderVideos(): void {
    this.root.innerHTML = this.withAuthModal(renderVideosPage());
    this.bindNav();
    bindMediaHub(this.root);
  }

  private renderSponsor(): void {
    const tiers = this.me?.economy?.sponsorTiers ?? [
      { id: 'supporter', label: 'Supporter', amountUsd: 100 },
      { id: 'champion', label: 'Champion', amountUsd: 500 },
      { id: 'benefactor', label: 'Benefactor', amountUsd: 2500 },
      { id: 'patron', label: 'Patron', amountUsd: 10000 },
      { id: 'visionary', label: 'Visionary', amountUsd: 25000 },
    ];
    this.root.innerHTML = this.withAuthModal(renderSponsorPage({ tiers }));
    this.bindNav();
    this.root.querySelector('#sponsor-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target as HTMLFormElement);
      const err = this.root.querySelector('#sponsor-error') as HTMLElement | null;
      const submit = (e.target as HTMLFormElement).querySelector(
        'button[type="submit"]'
      ) as HTMLButtonElement | null;
      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Opening Stripe…';
      }
      try {
        const tierId = String(fd.get('tierId') || '');
        const customAmount = fd.get('customAmount') ? Number(fd.get('customAmount')) : undefined;
        toastInfo('Redirecting to Stripe Checkout…', 2400);
        const result = await createSponsorCheckout({
          tierId,
          customAmount,
          sponsorName: String(fd.get('sponsorName') || ''),
          sponsorMessage: String(fd.get('sponsorMessage') || ''),
        });
        if (result.url) {
          window.location.href = result.url;
          return;
        }
        toastError('Checkout did not return a URL. Try again.');
      } catch (ex) {
        const msg = ex instanceof Error ? ex.message : 'Checkout failed';
        if (err) {
          err.hidden = false;
          err.textContent = msg;
        }
        toastError(msg);
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.textContent = 'Continue to secure checkout →';
        }
      }
    });
  }

  private renderHow(): void {
    const gameComplete = loadProgress() >= TOTAL_LEVELS;
    this.root.innerHTML = this.withAuthModal(
      renderHowItWorksPage(null, gameComplete, this.isSignedIn())
    );
    this.bindNav();
    this.root.querySelector('#how-goto-sponsor')?.addEventListener('click', () => this.go('sponsor'));
    this.root.querySelector('#how-play')?.addEventListener('click', () => {
      if (!this.requireAuth(AUTH_PLAY_REASON, { kind: 'play' })) return;
      this.startPlayAt();
    });
    this.root.querySelector('#how-goto-home')?.addEventListener('click', () => this.go('home'));
    this.root.querySelector('#how-goto-videos')?.addEventListener('click', () => this.go('videos'));
    this.root.querySelector('#how-goto-videos-2')?.addEventListener('click', () => this.go('videos'));
  }

  private renderCashout(): void {
    const progress = loadProgress();
    this.root.innerHTML = this.withAuthModal(renderCashoutPage(this.me, progress));
    this.bindNav();

    if (!this.isSignedIn()) {
      this.root.querySelector('#btn-auth-signup')?.addEventListener('click', () => {
        this.requireAuth(AUTH_CASHOUT_REASON, { kind: 'cashout' });
      });
      return;
    }

    if (progress < TOTAL_LEVELS) {
      toastInfo(
        `Withdrawal unlocks after all ${TOTAL_LEVELS} levels (you’re at ${progress}). You can still convert NAV → BTC now.`,
        4500
      );
    }

    this.root.querySelector('#exchange-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target as HTMLFormElement);
      const err = this.root.querySelector('#exchange-error') as HTMLElement | null;
      const ok = this.root.querySelector('#exchange-ok') as HTMLElement | null;
      const submit = (e.target as HTMLFormElement).querySelector(
        'button[type="submit"]'
      ) as HTMLButtonElement | null;
      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Converting…';
      }
      try {
        const amount = String(fd.get('amount') || '');
        const result = await exchange(amount || undefined);
        if (ok) {
          ok.hidden = false;
          ok.textContent = `Converted → ${result.receivedLabel}`;
        }
        if (err) err.hidden = true;
        toastSuccess(`Converted to ${result.receivedLabel}. Next: withdraw via Coinbase.`, 4000);
        await this.refreshMe();
        this.renderCashout();
      } catch (ex) {
        const msg = ex instanceof Error ? ex.message : 'Convert failed';
        if (err) {
          err.hidden = false;
          err.textContent = msg;
        }
        toastError(msg);
        if (submit) {
          submit.disabled = false;
          submit.textContent = 'Convert to BTC';
        }
      }
    });

    this.root.querySelector('#withdraw-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (progress < TOTAL_LEVELS) {
        toastWarn(`Finish all ${TOTAL_LEVELS} levels before withdrawing BTC.`, 3800);
        return;
      }
      const fd = new FormData(e.target as HTMLFormElement);
      const err = this.root.querySelector('#withdraw-error') as HTMLElement | null;
      const ok = this.root.querySelector('#withdraw-ok') as HTMLElement | null;
      const submit = (e.target as HTMLFormElement).querySelector(
        'button[type="submit"]'
      ) as HTMLButtonElement | null;
      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Submitting…';
      }
      try {
        const amount = String(fd.get('amount') || '');
        const result = await withdraw({
          assetCode: 'btc',
          amount: amount || undefined,
          destination: String(fd.get('destination')),
        });
        if (ok) {
          ok.hidden = false;
          ok.textContent = result.message;
        }
        if (err) err.hidden = true;
        toastSuccess(result.message || 'Withdrawal submitted via Coinbase.', 4200);
        await this.refreshMe();
      } catch (ex) {
        const msg = ex instanceof Error ? ex.message : 'Withdraw failed';
        if (err) {
          err.hidden = false;
          err.textContent = msg;
        }
        toastError(msg);
        if (submit) {
          submit.disabled = false;
          submit.textContent = 'Withdraw via Coinbase';
        }
      }
    });
  }

  private phraseProgress: { unlockOne: () => void; unlockAll: () => void; dispose: () => void } | null =
    null;

  private renderLevel(): void {
    if (!this.isSignedIn()) {
      this.screen = 'home';
      this.requireAuth(AUTH_PLAY_REASON, { kind: 'play' });
      return;
    }

    const level = TWEET_LEVELS_ALL[this.currentLevel];
    if (!level) {
      this.screen = 'complete';
      this.render();
      return;
    }

    this.phraseProgress?.dispose();
    this.phraseProgress = null;

    (window as unknown as { __currentLevel?: TweetLevel }).__currentLevel = level;
    const isIntro = this.phase === 'intro';
    const isSuccess = this.phase === 'success';
    const isPlaying = this.phase === 'playing';

    const boostNote = this.levelBoost.reveal
      ? `<p class="boost-note">Answer revealed — tap through when ready.</p>`
      : this.levelBoost.hint
        ? `<p class="boost-note">Hint: ${escapeHtml(this.levelBoost.hint)}</p>`
        : '';

    const lessonBlock = isPlaying
      ? `
        <article class="lesson lesson--play">
          ${renderTweetPlayChrome(level, { phase: 'playing' })}
          ${renderNavalGuide(level, 'playing')}
          ${boostNote}
        </article>`
      : isSuccess
        ? `
        <article class="lesson lesson--play">
          ${renderTweetPlayChrome(level, { phase: 'success' })}
          ${renderNavalGuide(level, 'success')}
        </article>`
        : `
        <article class="lesson lesson--open">
          ${renderTweetCard(level, TOTAL_LEVELS)}
          ${renderNavalGuide(level, 'intro')}
          ${boostNote}
        </article>`;

    this.root.innerHTML = this.withAuthModal(`
      <div class="screen screen--level phase--${this.phase}">
        ${renderLevelHeader(level, this.currentLevel, TOTAL_LEVELS)}
        ${renderWalletBar(this.me)}
        ${lessonBlock}
        ${isPlaying ? renderShopStrip(this.me) : ''}
        <section class="playfield ${isIntro ? 'playfield--waiting' : ''}" data-level="${level.id}">
          <div class="playfield-inner" id="level-canvas"></div>
          ${
            isIntro
              ? '<button class="btn-primary btn-primary--soft" id="btn-begin" type="button">Play this level — reveal the tweet</button>'
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

    if (isPlaying || isSuccess) {
      this.phraseProgress = bindTweetPhraseProgress(this.root);
    }

    if (isIntro) {
      this.root.querySelector('#btn-begin')?.addEventListener('click', () => {
        this.phase = 'playing';
        this.guidedTipKey = null;
        this.renderLevel();
        this.startChallenge();
      });
      this.guideOnce(
        `intro-${level.id}`,
        'Read the tweet, then tap Play this level when you’re ready.',
        2800
      );
    } else if (!isSuccess) {
      this.startChallenge();
    }
  }

  private async buyHelp(itemId: string): Promise<void> {
    const level = TWEET_LEVELS_ALL[this.currentLevel];
    if (!this.me?.user) {
      this.requireAuth(AUTH_PLAY_REASON, { kind: 'level', index: this.currentLevel });
      return;
    }
    try {
      toastInfo('Spending NAV…', 1600);
      const result = await spend(itemId, level?.id);
      clearMeCache();
      await this.refreshMe();

      if (result.effect === 'hint') {
        this.levelBoost.hint = level?.navalHint || 'Look for the pattern Naval describes.';
        toastSuccess(`Naval whisper unlocked (−${result.spentLabel}).`, 3200);
      } else if (result.effect === 'reveal') {
        this.levelBoost.reveal = true;
        this.levelBoost.hint = level?.navalSuccess || 'Follow the tweet.';
        toastSuccess(`Answer revealed (−${result.spentLabel}). Completing the level…`, 3200);
      } else if (result.effect === 'skip') {
        toastSuccess(`Level skipped (−${result.spentLabel}). Still earning the clear reward.`, 3600);
        await this.onLevelComplete(true);
        return;
      }
      this.renderLevel();
      const bal = this.root.querySelector('#wallet-nav-balance');
      if (bal) bal.textContent = result.navLabel;
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Purchase failed');
    }
  }

  private startChallenge(): void {
    const level = TWEET_LEVELS_ALL[this.currentLevel];
    const canvas = this.root.querySelector('#level-canvas') as HTMLElement;
    if (!canvas || !level) return;

    if (this.levelBoost.reveal) {
      void this.onLevelComplete(true);
      return;
    }

    const scaled = applyDifficulty(level);
    (window as unknown as { __currentLevel?: TweetLevel }).__currentLevel = scaled;
    const badge = this.root.querySelector('.tweet-play-kicker');
    if (badge) {
      badge.textContent = `Tweet ${level.id} · ${difficultyLabel(level.id)} · Build the lesson`;
    }
    this.guideOnce(`play-${level.id}-${level.type}`, tipForLevelType(level.type), 3800);
    if (!this.shopTipShown && (this.me?.economy?.shop?.length ?? 0) > 0) {
      this.shopTipShown = true;
      window.setTimeout(() => {
        toastInfo('Stuck? Spend NAV for a whisper, reveal, or skip.', 3600);
      }, 4200);
    }
    mountLevel(canvas, scaled, () => this.onLevelComplete(false));
  }

  private advanceAfterLevel(level: TweetLevel | undefined): void {
    this.currentLevel++;
    this.levelBoost = {};
    saveProgress(this.currentLevel);
    if (this.currentLevel >= TOTAL_LEVELS) {
      void notifyJourneyComplete(level?.id ?? TOTAL_LEVELS).then(() => {
        this.screen = 'complete';
        this.render();
      });
    } else {
      this.phase = 'intro';
      this.screen = 'level';
      this.render();
    }
  }

  private bindNavalBonus(offer: {
    questionId: string;
    question: string;
    hint?: string | null;
    bonusLabel: string;
    navalLine?: string;
  }, level: TweetLevel | undefined): void {
    const form = this.root.querySelector('#naval-bonus-form') as HTMLFormElement | null;
    const err = this.root.querySelector('#naval-bonus-error') as HTMLElement | null;
    const ok = this.root.querySelector('#naval-bonus-ok') as HTMLElement | null;
    const submit = this.root.querySelector('#naval-bonus-submit') as HTMLButtonElement | null;

    const closeAndAdvance = () => this.advanceAfterLevel(level);

    this.root.querySelector('#naval-bonus-skip')?.addEventListener('click', () => {
      toastInfo('Bonus skipped — on to the next tweet.', 2600);
      closeAndAdvance();
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const answer = String(fd.get('answer') || '').trim();
      if (answer.length < 12) {
        toastWarn('Say it in your own words — at least a full sentence.', 3200);
        return;
      }
      if (err) err.hidden = true;
      if (ok) ok.hidden = true;
      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Naval is thinking…';
      }
      try {
        const result = await scoreNavalBonus({ questionId: offer.questionId, answer });
        if (result.pass) {
          if (ok) {
            ok.hidden = false;
            ok.textContent = `${result.feedback} +${result.bonusLabel || offer.bonusLabel}`;
          }
          toastSuccess(
            result.bonusLabel || offer.bonusLabel
              ? `${result.feedback} +${result.bonusLabel || offer.bonusLabel}`
              : result.feedback || 'Naval agrees.',
            3800
          );
          await this.refreshMe();
          setTimeout(closeAndAdvance, 1600);
        } else {
          if (err) {
            err.hidden = false;
            err.textContent = result.feedback || 'Not quite.';
          }
          toastWarn(result.feedback || 'Not quite — try once more in your own words.', 3600);
          if (submit) {
            submit.disabled = false;
            submit.textContent = 'Try once more';
          }
          // One more try, then skip advances
          form.dataset.tries = String(Number(form.dataset.tries || 0) + 1);
          if (Number(form.dataset.tries) >= 2) {
            toastInfo('Moving on — keep the lesson, chase the next tweet.', 3200);
            setTimeout(closeAndAdvance, 1800);
          }
        }
      } catch (ex) {
        const msg = ex instanceof Error ? ex.message : 'Could not score answer';
        if (err) {
          err.hidden = false;
          err.textContent = msg;
        }
        toastError(msg);
        if (submit) {
          submit.disabled = false;
          submit.textContent = 'Answer Naval';
        }
      }
    });
  }

  private async onLevelComplete(fromShop: boolean): Promise<void> {
    const level = TWEET_LEVELS_ALL[this.currentLevel];
    this.phase = 'success';
    this.guidedTipKey = null;

    this.phraseProgress?.unlockAll();
    signalUnlockAll(this.root);

    toastInfo(fromShop ? 'Applying boost…' : 'Tweet cleared — claiming NAV…', 2200);
    const reward = await notifyLevelComplete(level?.id ?? this.currentLevel + 1);
    await this.refreshMe();

    if (reward.state === 'sent' && reward.amountLabel) {
      toastSuccess(`+${reward.amountLabel} added to your wallet.`, 3600);
    } else if (reward.state === 'sent') {
      toastSuccess(reward.message || 'Level reward recorded.', 3200);
    } else if (reward.state === 'needs_account') {
      toastWarn(reward.message || 'Sign in to earn NAV for clears.', 3800);
    } else if (reward.state === 'error' && reward.message) {
      toastError(reward.message);
    }

    this.renderLevel();
    this.phraseProgress?.unlockAll();

    const playfield = this.root.querySelector('.playfield');
    playfield?.classList.remove('playfield--waiting');

    const canvas = this.root.querySelector('#level-canvas');
    if (!canvas) return;

    const sheet = document.createElement('div');
    sheet.className = 'sheet';
    sheet.innerHTML = `
      <div class="sheet-body">
        <p class="sheet-label">${fromShop ? 'Boost used' : 'Tweet complete'}</p>
        ${renderLevelRewardBlock(reward)}
        <p class="sheet-text">${level?.navalSuccess ?? ''}</p>
        <div class="sheet-actions">
          <button class="btn-primary" id="btn-next" type="button">
            ${this.currentLevel + 1 >= TOTAL_LEVELS ? 'Finish quest' : 'Next tweet'}
          </button>
        </div>
      </div>
    `;
    canvas.appendChild(sheet);
    requestAnimationFrame(() => sheet.classList.add('sheet--visible'));

    sheet.querySelector('#btn-auth-signup')?.addEventListener('click', () => {
      this.requireAuth(AUTH_PLAY_REASON, { kind: 'level', index: this.currentLevel });
    });

    const goNext = () => this.advanceAfterLevel(level);

    sheet.querySelector('#btn-next')?.addEventListener('click', async () => {
      // Try Naval AI bonus roll before advancing (hard timeout so play never sticks)
      if (!level || !this.me?.user) {
        goNext();
        return;
      }
      const nextBtn = sheet.querySelector('#btn-next') as HTMLButtonElement | null;
      if (nextBtn) {
        nextBtn.disabled = true;
        nextBtn.textContent = 'Checking for Naval…';
      }
      try {
        const roll = await Promise.race([
          rollNavalBonus({
            level: level.id,
            tweet: level.tweet,
            title: level.title,
            navalIntro: level.navalIntro,
          }),
          new Promise<{ offer: false; reason: string }>((resolve) =>
            setTimeout(() => resolve({ offer: false, reason: 'client_timeout' }), 10000)
          ),
        ]);
        if (roll.offer && roll.questionId && roll.question && roll.bonusLabel) {
          toastInfo(`Naval appears — answer for a chance at +${roll.bonusLabel}.`, 3600);
          this.root.insertAdjacentHTML(
            'beforeend',
            renderNavalBonusModal({
              questionId: roll.questionId,
              question: roll.question,
              hint: roll.hint,
              bonusLabel: roll.bonusLabel,
              navalLine: roll.navalLine,
            })
          );
          this.bindNavalBonus(
            {
              questionId: roll.questionId,
              question: roll.question,
              hint: roll.hint,
              bonusLabel: roll.bonusLabel,
              navalLine: roll.navalLine,
            },
            level
          );
          return;
        }
      } catch {
        /* skip bonus on error */
      }
      goNext();
    });
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
          <p class="lede lede--dim">Your NAV balance is ready. Convert to BTC, then withdraw via Coinbase.</p>
          <div class="actions">
            <button class="btn-primary" id="btn-cashout-final" type="button">Cash out</button>
            <button class="btn-text" id="btn-home-final" type="button">Home</button>
          </div>
        </div>
        ${renderSlykDock({ highlight: true })}
      </div>
    `);
    this.bindNav();
    this.guideOnce(
      'quest-complete',
      'Quest complete — convert NAV → BTC when you’re ready to cash out.',
      4200,
      'success'
    );
    this.root.querySelector('#btn-cashout-final')?.addEventListener('click', () => {
      if (!this.requireAuth(AUTH_CASHOUT_REASON, { kind: 'cashout' })) return;
      this.go('cashout');
    });
    this.root.querySelector('#btn-home-final')?.addEventListener('click', () => this.go('home'));
  }
}
