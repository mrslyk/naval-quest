import { TOTAL_LEVELS } from '../data/tweets';
import { escapeHtml } from '../utils';

export function renderHowFlowAnimation(symbol: string): string {
  const steps = [
    { icon: '▶', title: 'Play', desc: `${TOTAL_LEVELS} tweet levels with puzzles` },
    { icon: '◎', title: 'Learn', desc: 'Podcast clips + Naval quotes per level' },
    { icon: '+', title: 'Earn', desc: `${escapeHtml(symbol)} in your Slyk wallet` },
    { icon: '₿', title: 'Cash out', desc: 'Convert to BTC via Coinbase' },
  ];

  return `
    <section class="how-flow" aria-label="How Naval Quest works">
      <h2 class="section-title">How it works</h2>
      <p class="section-lede">Four steps from tweet to payout — watch the loop.</p>
      <div class="how-flow-track">
        ${steps
          .map(
            (s, i) => `
          <article class="how-flow-step" style="--step:${i}">
            <span class="how-flow-icon" aria-hidden="true">${s.icon}</span>
            <h3 class="how-flow-title">${escapeHtml(s.title)}</h3>
            <p class="how-flow-desc">${s.desc}</p>
          </article>`
          )
          .join('<span class="how-flow-connector" aria-hidden="true"></span>')}
      </div>
      <div class="how-flow-progress" aria-hidden="true">
        <span class="how-flow-dot"></span>
        <span class="how-flow-dot"></span>
        <span class="how-flow-dot"></span>
        <span class="how-flow-dot"></span>
      </div>
    </section>
  `;
}
