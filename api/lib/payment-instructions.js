/**
 * Funding instructions per Slyk payment method slug.
 * Reference code is included so admins can match incoming payments.
 */

export function buildInstructions(slug, { reference, amount, assetCode, supportEmail, payspaceOrigin }) {
  const amt = amount || 'your chosen amount';
  const asset = (assetCode || 'USD').toUpperCase();
  const ref = reference || 'NQ-REFERENCE';
  const support = supportEmail || 'support@naval.slyk.io';
  const store = `${payspaceOrigin.replace(/\/$/, '')}/products`;

  const common = `Include reference <strong>${ref}</strong> with your payment so we can credit the Naval Quest prize pool.`;

  const bySlug = {
    stripe: {
      title: 'Pay by card',
      steps: [
        'Complete checkout on Slyk with a credit or debit card.',
        `Amount: <strong>${amt} ${asset}</strong>. ${common}`,
        'Funds are credited to the prize pool once payment clears (usually instant).',
      ],
      actionUrl: store,
      actionLabel: 'Pay with card on Slyk',
    },
    paypal: {
      title: 'PayPal',
      steps: [
        `Send <strong>${amt} ${asset}</strong> via PayPal.`,
        `In the note/memo field write: <strong>${ref}</strong>.`,
        `Email your PayPal receipt to <strong>${support}</strong> with subject "Naval Quest Fund".`,
        'We confirm by email within 1–2 business days.',
      ],
    },
    usdc: {
      title: 'USDC',
      steps: [
        `Send <strong>${amt} USDC</strong> on a supported network.`,
        `Memo / message: <strong>${ref}</strong>.`,
        `Email your transaction hash to <strong>${support}</strong>.`,
        'USDC is credited to the pool after on-chain confirmation.',
      ],
    },
    coinbase: {
      title: 'Coinbase / crypto',
      steps: [
        `Send <strong>${amt}</strong> in BTC, ETH, USDC, or DAI via Coinbase.`,
        `Reference: <strong>${ref}</strong>.`,
        `Email proof of transfer to <strong>${support}</strong>.`,
      ],
    },
    uphold: {
      title: 'Uphold',
      steps: [
        `Transfer <strong>${amt}</strong> in crypto via Uphold.`,
        `Reference: <strong>${ref}</strong>.`,
        `Notify <strong>${support}</strong> with your Uphold transaction ID.`,
      ],
    },
    wire: {
      title: 'Bank wire',
      steps: [
        `Wire <strong>${amt} ${asset}</strong> to the bank account shown in your Slyk dashboard deposit flow.`,
        `Reference / beneficiary note: <strong>${ref}</strong>.`,
        'Wires typically settle in 1–3 business days.',
        `Questions: <strong>${support}</strong>.`,
      ],
      actionUrl: `${payspaceOrigin.replace(/\/$/, '')}/dashboard/add-funds`,
      actionLabel: 'View wire details on Slyk',
    },
    zelle: {
      title: 'Zelle',
      steps: [
        `Send <strong>${amt} USD</strong> via Zelle.`,
        `Memo: <strong>${ref}</strong>.`,
        `Email your Zelle confirmation to <strong>${support}</strong>.`,
      ],
    },
    venmo: {
      title: 'Venmo',
      steps: [
        `Send <strong>${amt} USD</strong> via Venmo.`,
        `Note: <strong>${ref}</strong>.`,
        `Email a screenshot to <strong>${support}</strong>.`,
      ],
    },
    cashapp: {
      title: 'Cash App',
      steps: [
        `Send <strong>${amt}</strong> via Cash App.`,
        `Note: <strong>${ref}</strong>.`,
        `Email confirmation to <strong>${support}</strong>.`,
      ],
    },
    pix: {
      title: 'Pix',
      steps: [
        `Pix <strong>${amt} BRL</strong>.`,
        `Reference / descrição: <strong>${ref}</strong>.`,
        `Email comprovante to <strong>${support}</strong>.`,
      ],
    },
    btc: {
      title: 'Bitcoin',
      steps: [
        `Send <strong>${amt} BTC</strong>.`,
        `Reference in memo if available: <strong>${ref}</strong>.`,
        `Email transaction ID to <strong>${support}</strong>.`,
      ],
    },
    eth: {
      title: 'Ethereum',
      steps: [
        `Send <strong>${amt} ETH</strong>.`,
        `Reference: <strong>${ref}</strong>.`,
        `Email transaction hash to <strong>${support}</strong>.`,
      ],
    },
    dai: {
      title: 'DAI',
      steps: [
        `Send <strong>${amt} DAI</strong>.`,
        `Reference: <strong>${ref}</strong>.`,
        `Email transaction hash to <strong>${support}</strong>.`,
      ],
    },
    cash: {
      title: 'Cash / check',
      steps: [
        `Prepare <strong>${amt} ${asset}</strong> cash or check payable to the community.`,
        `Write <strong>${ref}</strong> on the memo line.`,
        `Contact <strong>${support}</strong> to arrange handoff or mailing.`,
      ],
    },
    other: {
      title: 'Other method',
      steps: [
        `Amount: <strong>${amt} ${asset}</strong>.`,
        `Reference: <strong>${ref}</strong>.`,
        `Email <strong>${support}</strong> with how you would like to pay — we will reply with instructions.`,
      ],
    },
  };

  const template = bySlug[slug] || bySlug.other;
  return { slug, ...template, reference: ref };
}

export function pickFundingMethods(methods) {
  const priority = [
    'stripe',
    'paypal',
    'usdc',
    'coinbase',
    'wire',
    'zelle',
    'venmo',
    'cashapp',
    'uphold',
    'btc',
    'eth',
    'dai',
    'pix',
    'skrill',
    'payoneer',
    'airtm',
    'cash',
    'other',
  ];

  const sorted = [...methods].sort((a, b) => {
    const ai = priority.indexOf(a.slug);
    const bi = priority.indexOf(b.slug);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return sorted.filter((m) => priority.includes(m.slug) || m.featured);
}
