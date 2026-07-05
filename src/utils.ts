const STORAGE_KEY = 'naval-quest-progress';

function syncProgressCookie(level: number): void {
  document.cookie = `nq_progress=${level}; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}`;
}

export function loadProgress(): number {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return 0;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

export function saveProgress(level: number): void {
  localStorage.setItem(STORAGE_KEY, String(level));
  syncProgressCookie(level);
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
  syncProgressCookie(0);
}

export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function haptic(): void {
  if ('vibrate' in navigator) navigator.vibrate(12);
}
