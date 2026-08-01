import { escapeHtml } from '../utils';

export function renderHowFlowAnimation(symbol: string): string {
  return `
    <section class="wq-howto" aria-label="How to play">
      <h2 class="wq-howto-title">How to play</h2>
      <ul class="wq-howto-list">
        <li>
          <span class="wq-tile wq-tile--sm wq-tile--correct"><span class="wq-tile-letter">W</span></span>
          <p><strong>Sign up</strong> free — required to play and earn ${escapeHtml(symbol)}.</p>
        </li>
        <li>
          <span class="wq-tile wq-tile--sm wq-tile--present"><span class="wq-tile-letter">E</span></span>
          <p><strong>Play</strong> one Naval tweet per level; learn with podcast clips.</p>
        </li>
        <li>
          <span class="wq-tile wq-tile--sm wq-tile--absent"><span class="wq-tile-letter">A</span></span>
          <p><strong>Cash out</strong> BTC via Coinbase when you finish all 39.</p>
        </li>
      </ul>
      <p class="wq-howto-legend">
        <span><i class="wq-swatch wq-swatch--correct"></i> Correct</span>
        <span><i class="wq-swatch wq-swatch--present"></i> Close</span>
        <span><i class="wq-swatch wq-swatch--absent"></i> Miss</span>
      </p>
    </section>
  `;
}
