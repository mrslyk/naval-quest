import { escapeHtml } from '../utils';

export interface BonusOffer {
  questionId: string;
  question: string;
  hint?: string | null;
  bonusLabel: string;
  navalLine?: string;
}

export function renderNavalBonusModal(offer: BonusOffer): string {
  return `
    <div class="naval-bonus" id="naval-bonus" role="dialog" aria-labelledby="naval-bonus-title">
      <div class="naval-bonus-card">
        <div class="naval-bonus-head">
          <span class="naval-bonus-avatar" aria-hidden="true">N</span>
          <div>
            <p class="naval-bonus-kicker">${escapeHtml(offer.navalLine || 'Naval appears.')}</p>
            <h2 class="naval-bonus-title" id="naval-bonus-title">Bonus question</h2>
          </div>
        </div>
        <p class="naval-bonus-q">${escapeHtml(offer.question)}</p>
        ${offer.hint ? `<p class="naval-bonus-hint">Hint: ${escapeHtml(offer.hint)}</p>` : ''}
        <p class="naval-bonus-stake">Answer in your own words · Win <strong>${escapeHtml(offer.bonusLabel)}</strong></p>
        <form id="naval-bonus-form" class="naval-bonus-form">
          <textarea
            class="naval-bonus-input"
            name="answer"
            rows="4"
            maxlength="2000"
            required
            placeholder="Explain the idea — don’t paste the tweet…"
          ></textarea>
          <p class="field-error" id="naval-bonus-error" hidden></p>
          <p class="naval-bonus-ok" id="naval-bonus-ok" hidden></p>
          <div class="naval-bonus-actions">
            <button type="submit" class="wq-play" id="naval-bonus-submit">Answer Naval</button>
            <button type="button" class="wq-btn-ghost" id="naval-bonus-skip">Skip</button>
          </div>
        </form>
      </div>
    </div>
  `;
}
