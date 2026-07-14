import { escapeHtml } from '../utils';

export type NavPage = 'home' | 'play' | 'videos' | 'sponsor' | 'how';

export function renderTopNav(active: NavPage): string {
  const link = (page: NavPage, label: string, id: string) => {
    const isActive = active === page;
    return `<button class="topnav-link${isActive ? ' topnav-link--active' : ''}" type="button" id="${id}" aria-current="${isActive ? 'page' : 'false'}">${escapeHtml(label)}</button>`;
  };

  return `
    <header class="topnav">
      <div class="topnav-inner">
        <button class="topnav-brand" type="button" id="nav-home">Naval Quest</button>
        <nav class="topnav-menu" aria-label="Main">
          ${link('play', 'Play', 'nav-play')}
          ${link('videos', 'Videos', 'nav-videos')}
          ${link('sponsor', 'Sponsor', 'nav-sponsor')}
          ${link('how', 'How it works', 'nav-how')}
        </nav>
      </div>
    </header>
  `;
}

export function bindTopNav(root: HTMLElement, handlers: {
  onHome: () => void;
  onPlay: () => void;
  onVideos: () => void;
  onSponsor: () => void;
  onHow: () => void;
}): void {
  root.querySelector('#nav-home')?.addEventListener('click', handlers.onHome);
  root.querySelector('#nav-play')?.addEventListener('click', handlers.onPlay);
  root.querySelector('#nav-videos')?.addEventListener('click', handlers.onVideos);
  root.querySelector('#nav-sponsor')?.addEventListener('click', handlers.onSponsor);
  root.querySelector('#nav-how')?.addEventListener('click', handlers.onHow);
}
