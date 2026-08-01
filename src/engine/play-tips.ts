import type { LevelType } from '../data/tweets';

/** Short guidance shown when a level starts playing. */
export function tipForLevelType(type: LevelType): string {
  switch (type) {
    case 'sort':
      return 'Drag each item into the bucket that matches Naval’s definition.';
    case 'choice':
      return 'Choose the belief that fits the tweet — not the status trap.';
    case 'tap-sequence':
      return 'Tap the steps in the right order to build the lesson.';
    case 'match':
      return 'Pair each idea with its match until every link is clear.';
    case 'slider':
      return 'Slide until you hit Naval’s balance — close isn’t always enough.';
    case 'partner-pick':
      return 'Pick partners with intelligence, energy, and integrity. Skip cynics.';
    case 'compound':
      return 'Keep compounding each round — returns grow when you stay in the game.';
    case 'path':
      return 'Walk the path that matches the tweet. Dead ends teach too.';
    case 'collect':
      return 'Collect permissionless leverage. Leave the gated stuff behind.';
    case 'avoid':
      return 'Tap the good signals. Ignore status noise and cynics.';
    default:
      return 'Solve the puzzle to unlock the tweet and earn NAV.';
  }
}

export const AUTH_PLAY_REASON =
  'Create a free account to play. Progress and NAV rewards need a signed-in wallet.';

export const AUTH_CASHOUT_REASON =
  'Sign in to convert NAV and withdraw BTC from your Slyk wallet.';

export const AUTH_SPONSOR_REASON =
  'Optional: sign in so we can link your sponsorship — or continue as a guest patron.';
