import { getSlykContext } from './config';
import { clearMeCache } from './session';

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (msg: string) => void };
    messages?: { emit: (event: string, data?: unknown) => void };
  }
}

export type SlykRewardState = 'idle' | 'pending' | 'sent' | 'error' | 'needs_account';

export interface LevelRewardResult {
  state: SlykRewardState;
  amountLabel: string | null;
  message: string | null;
}

let lastReward: LevelRewardResult = { state: 'idle', amountLabel: null, message: null };

export function getLastReward(): LevelRewardResult {
  return lastReward;
}

/** Pay out NAV when a level is cleared. */
export async function notifyLevelComplete(levelId: number): Promise<LevelRewardResult> {
  const ctx = getSlykContext();

  if (window.ReactNativeWebView) {
    lastReward = {
      state: 'sent',
      amountLabel: null,
      message: 'Reward sent to your Slyk wallet.',
    };
    window.ReactNativeWebView.postMessage('purchase');
    return lastReward;
  }

  lastReward = { state: 'pending', amountLabel: null, message: null };

  try {
    const res = await fetch('/api/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        taskId: ctx.taskId,
        userId: ctx.userId,
        level: levelId,
        slug: ctx.slug,
      }),
    });

    const body = await res.json().catch(() => ({}));

    if (res.status === 401) {
      lastReward = {
        state: 'needs_account',
        amountLabel: null,
        message: 'Sign in to earn NAV for each level.',
      };
      return lastReward;
    }

    if (!res.ok) {
      lastReward = {
        state: 'error',
        amountLabel: null,
        message: body.error || `Reward failed (${res.status})`,
      };
      return lastReward;
    }

    clearMeCache();

    if (body.alreadyClaimed) {
      lastReward = {
        state: 'sent',
        amountLabel: null,
        message: 'Already earned for this level',
      };
      return lastReward;
    }

    lastReward = {
      state: 'sent',
      amountLabel: body.amountLabel ?? null,
      message: body.amountLabel
        ? `+${body.amountLabel} added to your wallet`
        : body.message || 'Level reward sent.',
    };
    return lastReward;
  } catch {
    lastReward = { state: 'error', amountLabel: null, message: 'Could not reach Slyk. Try again.' };
    return lastReward;
  }
}

export async function notifyJourneyComplete(levelId = 39): Promise<LevelRewardResult> {
  const result = await notifyLevelComplete(levelId);
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage('purchase');
  }
  return result;
}
