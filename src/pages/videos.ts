import { renderSlykDock } from '../components/ui';
import { renderTopNav } from '../components/nav';
import { renderMediaHub } from '../components/media-hub';

export function renderVideosPage(): string {
  return `
    <div class="screen screen--page screen--videos">
      ${renderTopNav('videos')}
      <main class="page-main page-main--wide">
        <section class="page-section page-section--wide">
          <p class="page-kicker">Naval media library</p>
          <h1 class="page-title">Videos, podcast &amp; reading</h1>
          <p class="page-lede">
            Deep-dive interviews and the full 3-hour podcast — explore while you play, or binge before you start.
          </p>
          ${renderMediaHub()}
        </section>
      </main>
      ${renderSlykDock()}
    </div>
  `;
}
