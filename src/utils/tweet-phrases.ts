/**
 * Split Naval tweets into playable phrase chunks for Wordle-style unlocks.
 */
export function tweetPhrases(tweet: string, max = 6): string[] {
  const cleaned = tweet.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];

  // Prefer sentence / clause boundaries
  let parts = cleaned
    .split(/(?<=[.!?])\s+|(?<=;)\s+| — | – | - /)
    .map((p) => p.trim())
    .filter(Boolean);

  // If still one long blob, split on commas between clauses
  if (parts.length === 1 && cleaned.length > 90) {
    parts = cleaned
      .split(/,\s+(?=[A-Z]|you |your |the |a |an |if |to |and )/)
      .map((p) => p.trim())
      .filter((p) => p.length > 8);
  }

  // Soft-merge tiny fragments
  const merged: string[] = [];
  for (const p of parts) {
    if (merged.length && (p.length < 18 || merged[merged.length - 1].length < 22)) {
      merged[merged.length - 1] = `${merged[merged.length - 1]} ${p}`.trim();
    } else {
      merged.push(p);
    }
  }

  if (merged.length <= max) return merged;

  // Pack into max buckets by roughly equal length
  const target = Math.ceil(cleaned.length / max);
  const packed: string[] = [];
  let buf = '';
  for (const p of merged) {
    if (!buf) {
      buf = p;
      continue;
    }
    if (buf.length + p.length < target || packed.length >= max - 1) {
      buf = `${buf} ${p}`;
    } else {
      packed.push(buf);
      buf = p;
    }
  }
  if (buf) packed.push(buf);
  return packed.slice(0, max);
}

/** Pull a short lesson hook from the tweet for UI chrome. */
export function tweetHook(tweet: string): string {
  const phrases = tweetPhrases(tweet, 3);
  return phrases[0] ?? tweet.slice(0, 72);
}

export const CORRECT_STEP_EVENT = 'naval-correct-step';

export function signalCorrectStep(from?: EventTarget | null): void {
  const target = from ?? document;
  target.dispatchEvent(
    new CustomEvent(CORRECT_STEP_EVENT, { bubbles: true, composed: true })
  );
}

export function signalUnlockAll(from?: EventTarget | null): void {
  const target = from ?? document;
  target.dispatchEvent(
    new CustomEvent('naval-unlock-all-phrases', { bubbles: true, composed: true })
  );
}
