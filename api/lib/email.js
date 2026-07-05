/**
 * Send fund confirmation email (Resend if configured, else no-op).
 */

export async function sendFundConfirmation({ to, name, reference, amount, assetCode, paymentMethod, instructions }) {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.FUND_EMAIL_FROM || 'Naval Quest <onboarding@resend.dev>';
  const support = process.env.FUND_SUPPORT_EMAIL || 'plg@slyk.io';

  const subject = `Naval Quest — funding instructions (${reference})`;
  const steps = (instructions?.steps || []).map((s) => `• ${s.replace(/<[^>]+>/g, '')}`).join('\n');

  const text = `Hi ${name},

Thank you for funding Naval Quest.

Reference: ${reference}
Amount: ${amount} ${assetCode}
Payment method: ${paymentMethod}

${steps}

Questions? Reply to ${support}.

— Naval Quest · powered by Slyk
`;

  const html = `
    <p>Hi ${name},</p>
    <p>Thank you for funding <strong>Naval Quest</strong>.</p>
    <ul>
      <li><strong>Reference:</strong> ${reference}</li>
      <li><strong>Amount:</strong> ${amount} ${assetCode}</li>
      <li><strong>Method:</strong> ${paymentMethod}</li>
    </ul>
    ${(instructions?.steps || []).map((s) => `<p>${s}</p>`).join('')}
    <p>Questions? <a href="mailto:${support}">${support}</a></p>
  `;

  if (!resendKey) {
    return { sent: false, reason: 'RESEND_API_KEY not configured', preview: text };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      bcc: support !== to ? [support] : undefined,
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Email send failed');
  }

  return { sent: true };
}
