import { escapeHtml } from '../utils';

export type NavPage = 'home' | 'fund' | 'how' | 'play';

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
          ${link('fund', 'Fund this game', 'nav-fund')}
          ${link('how', 'How it works', 'nav-how')}
          ${link('play', 'Play', 'nav-play')}
        </nav>
      </div>
    </header>
  `;
}

export function bindTopNav(root: HTMLElement, handlers: {
  onHome: () => void;
  onFund: () => void;
  onHow: () => void;
  onPlay: () => void;
}): void {
  root.querySelector('#nav-home')?.addEventListener('click', handlers.onHome);
  root.querySelector('#nav-fund')?.addEventListener('click', handlers.onFund);
  root.querySelector('#nav-how')?.addEventListener('click', handlers.onHow);
  root.querySelector('#nav-play')?.addEventListener('click', handlers.onPlay);
}
