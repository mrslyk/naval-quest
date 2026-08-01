export type ToastKind = 'info' | 'success' | 'error' | 'warn';

const HOST_ID = 'nq-toast-host';
const MAX_VISIBLE = 3;

function ensureHost(): HTMLElement {
  let host = document.getElementById(HOST_ID);
  if (!host) {
    host = document.createElement('div');
    host.id = HOST_ID;
    host.className = 'nq-toast-host';
    host.setAttribute('aria-live', 'polite');
    host.setAttribute('aria-relevant', 'additions');
    document.body.appendChild(host);
  }
  return host;
}

/** Show a guided toast near the top of the viewport. */
export function showToast(
  message: string,
  kind: ToastKind = 'info',
  durationMs = 3400
): void {
  const text = String(message || '').trim();
  if (!text) return;

  const host = ensureHost();
  while (host.children.length >= MAX_VISIBLE) {
    host.firstElementChild?.remove();
  }

  const el = document.createElement('div');
  el.className = `nq-toast nq-toast--${kind}`;
  el.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  el.innerHTML = `<span class="nq-toast-dot" aria-hidden="true"></span><span class="nq-toast-text"></span>`;
  el.querySelector('.nq-toast-text')!.textContent = text;
  host.appendChild(el);

  requestAnimationFrame(() => el.classList.add('nq-toast--visible'));

  const ms = Math.max(1600, durationMs);
  window.setTimeout(() => {
    el.classList.remove('nq-toast--visible');
    el.classList.add('nq-toast--leaving');
    window.setTimeout(() => el.remove(), 220);
  }, ms);
}

export function toastInfo(message: string, ms?: number): void {
  showToast(message, 'info', ms);
}

export function toastSuccess(message: string, ms?: number): void {
  showToast(message, 'success', ms);
}

export function toastError(message: string, ms?: number): void {
  showToast(message, 'error', ms ?? 4200);
}

export function toastWarn(message: string, ms?: number): void {
  showToast(message, 'warn', ms);
}
