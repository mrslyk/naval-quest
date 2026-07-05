/**
 * Initiate deposit via Stripe, PayPal, or Coinbase.
 * Uses user JWT → widget when available; falls back to API-key deposit intent.
 */
import { requireSession } from './lib/session.js';
import { readBody } from './lib/http.js';
import { FUND_RAILS } from './lib/economy.js';
import { slykPost, widgetPost } from './lib/slyk.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = requireSession(req, res);
  if (!session) return;

  const { railId, amount } = await readBody(req);
  const rail = FUND_RAILS.find((r) => r.id === railId);
  if (!rail) return res.status(400).json({ error: 'Choose stripe, paypal, or coinbase' });
  if (!amount || Number(amount) <= 0) return res.status(400).json({ error: 'Amount required' });

  const origin = process.env.NAVAL_GAME_ORIGIN || process.env.SLYK_PAYSPACE_ORIGIN || 'https://naval.slyk.io';
  const confirmationUrl = `${origin.replace(/\/$/, '')}/?deposit=ok&rail=${rail.id}`;
  const cancelUrl = `${origin.replace(/\/$/, '')}/?deposit=cancel&rail=${rail.id}`;

  const payload = {
    amount: String(amount),
    assetCode: rail.assetCode,
    code: rail.code,
    data: {
      cancelUrl,
      confirmationUrl,
      description: `Naval Quest fund via ${rail.name}`,
      depositOrigin: session.email,
    },
  };

  try {
    // Prefer user-scoped widget (same path as mobile app).
    let tx;
    try {
      tx = await widgetPost('/widget/deposit', payload, session.token);
    } catch (widgetErr) {
      // Fallback: API-key deposit to primary wallet (pending until provider/admin settles).
      tx = await slykPost('/transactions/deposit', {
        ...payload,
        destinationWalletId: session.primaryWalletId,
      });
      return res.status(200).json({
        ok: true,
        mode: 'pending',
        transaction: tx,
        message:
          widgetErr.message ||
          `${rail.name} deposit recorded as pending. Connect ${rail.id} in the Slyk dashboard for live checkout, or an admin will confirm.`,
        redirectUrl: null,
      });
    }

    const redirectUrl =
      tx?.metadata?.gatewayPurchaseResponse?.redirectUrl ||
      tx?.metadata?.redirectUrl ||
      null;
    const clientSecret =
      tx?.metadata?.gatewayPurchaseResponse?.clientSecret ||
      tx?.metadata?.clientSecret ||
      null;

    return res.status(200).json({
      ok: true,
      mode: redirectUrl || clientSecret ? 'automated' : 'pending',
      transaction: { id: tx.id, status: tx.status, amount: tx.amount, assetCode: tx.assetCode },
      redirectUrl,
      clientSecret,
      message: redirectUrl
        ? `Continue to ${rail.name} to complete your deposit.`
        : clientSecret
          ? 'Complete card payment with Stripe.'
          : `Deposit intent created (${tx.status}).`,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      error: err.message || String(err),
      hint: `Connect ${rail.id} under Payment methods in the Naval Slyk dashboard for live ${rail.name} checkout.`,
    });
  }
}
