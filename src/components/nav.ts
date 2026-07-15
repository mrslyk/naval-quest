import { escapeHtml } from '../utils';

export type NavPage = 'home' | 'play' | 'videos' | 'sponsor' | 'how';

export function renderTopNav(active: NavPage): string {
  const link = (page: NavPage, label: string, id: string) => {
    const isActive = active === page;
    return `<button class="wq-nav-link${isActive ? ' wq-nav-link--active' : ''}" type="button" id="${id}" aria-current="${isActive ? 'page' : 'false'}">${escapeHtml(label)}</button>`;
  };

  return `
    <header class="wq-nav">
      <div class="wq-nav-side wq-nav-side--left">
        ${link('how', 'Help', 'nav-how')}
        ${link('videos', 'Videos', 'nav-videos')}
      </div>
      <button class="wq-nav-brand" type="button" id="nav-home">Naval Quest</button>
      <div class="wq-nav-side wq-nav-side--right">
        ${link('sponsor', 'Sponsor', 'nav-sponsor')}
        ${link('play', 'Play', 'nav-play')}
      </div>
    </header>
  `;
}

export function bindTopNav(
  root: HTMLElement,
  handlers: {
    onHome: () => void;
    onPlay: () => void;
    onVideos: () => void;
    onSponsor: () => void;
    onHow: () => void;
  }
): void {
  root.querySelector('#nav-home')?.addEventListener('click', handlers.onHome);
  root.querySelector('#nav-play')?.addEventListener('click', handlers.onPlay);
  root.querySelector('#nav-videos')?.addEventListener('click', handlers.onVideos);
  root.querySelector('#nav-sponsor')?.addEventListener('click', handlers.onSponsor);
  root.querySelector('#nav-how')?.addEventListener('click', handlers.onHow);
}
