import { slykList } from './lib/slyk.js';
import { getSlykConfig } from './lib/slyk.js';
import { buildInstructions } from './lib/payment-instructions.js';
import { sendFundConfirmation } from './lib/email.js';

function makeReference() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NQ-${t}-${r}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { apiKey } = getSlykConfig();
  if (!apiKey) {
    return res.status(503).json({ error: 'SLYK_API_KEY not configured' });
  }

  const { name, email, amount, assetCode = 'USD', paymentMethod, message } = req.body ?? {};

  if (!name?.trim() || !email?.trim()) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }
  if (!paymentMethod) {
    return res.status(400).json({ error: 'Payment method required' });
  }
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than 0' });
  }

  const settings = await slykList('/settings', { page: 1, size: 100 }).catch(() => []);
  const supportEmail = settings.find((s) => s.code === 'supportEmail')?.value || 'plg@slyk.io';
  const payspaceOrigin = process.env.SLYK_PAYSPACE_ORIGIN || 'https://naval.slyk.io';
  const reference = makeReference();

  const instructions = buildInstructions(paymentMethod, {
    reference,
    amount,
    assetCode,
    supportEmail,
    payspaceOrigin,
  });

  let emailResult = { sent: false };
  try {
    emailResult = await sendFundConfirmation({
      to: email.trim(),
      name: name.trim(),
      reference,
      amount,
      assetCode,
      paymentMethod: instructions.title || paymentMethod,
      instructions,
    });
  } catch (err) {
    emailResult = { sent: false, error: String(err) };
  }

  return res.status(200).json({
    ok: true,
    reference,
    instructions,
    email: emailResult,
    message:
      'Save your reference code. We sent funding instructions to your email when delivery is configured.',
  });
}
