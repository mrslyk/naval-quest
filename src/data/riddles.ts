import { TweetLevel } from './tweets';

/** Visual riddle copy — shown above each puzzle board. */
export const RIDDLES: Record<number, string> = {
  1: 'Three jars from the tweet: wealth, money, status. Place each symbol.',
  2: 'A vault labeled wealth. Only one belief unlocks it.',
  3: 'Builders create. Status players attack. Tap only builders.',
  4: 'Time has a ceiling. Equity does not. Choose ownership.',
  5: 'Society wants something — connect each want to its invention.',
  6: 'Two paths: hype cycle or twenty-year game. Stay long.',
  7: 'Reveal careers the old map hid. The internet expanded the board.',
  8: 'Reinvest each round. Watch compound interest multiply.',
  9: 'A triangle of intelligence, energy, integrity. All three required.',
  10: 'Optimism builds. Cynicism infects. Tap only the builders.',
  11: 'Two halves of one key: build and sell. Both required.',
  12: 'Three slots on a shield: specific knowledge, accountability, leverage.',
  13: 'Mass training clones you. Find what cannot be taught.',
  14: 'Trends flash. Curiosity whispers. Follow curiosity.',
  15: 'Your screen says play. Theirs says work. Set yours to play.',
  16: 'Sign your name or stay anonymous. Skin in the game unlocks reward.',
  17: 'Four levers — collect the two that need no permission.',
  18: 'Deploy assets that earn while you sleep.',
  19: 'Set an hourly rate. Enforce it.',
  20: 'Narrow until you are best in the world.',
  21: 'Four types of leverage. Zero marginal cost wins.',
  22: 'Capital follows judgment. Prove all three.',
  23: 'Headcount impresses parents. Profit needs restraint.',
  24: 'Some doors need permission. Others stay open.',
  25: 'Set up before sleep. Let code and media work overnight.',
  26: 'Robots wait in the data center. Unpack them.',
  27: 'Cannot code? Media is another lever. Choose your branch.',
  28: 'Judgment alone stalls. Multiply it with leverage.',
  29: 'Foundations accelerate judgment faster than waiting.',
  30: 'No skill called business. Filter the noise.',
  31: 'Seven subjects. One web. Connect them all.',
  32: 'Read beats listen. Do beats watch. Take the fast path.',
  33: 'Decline coffee. Keep white space. Fill with what matters.',
  34: 'Your time has a price. Filter the conveyor.',
  35: 'Effort alone caps out. Direction multiplies it.',
  36: 'Keep narrowing. Best in the world is a moving target.',
  37: 'Spot the scheme. Someone else gets rich — not you.',
  38: 'The whole thread in one equation. Balance it.',
  39: 'Wealth fades. What were you actually seeking?',
};

export function riddleFor(level: TweetLevel): string {
  return level.riddle ?? RIDDLES[level.id] ?? level.navalHint;
}
