/**
 * Aggregates Naval Quest prize pool, tasks, and funding links from Slyk.
 */

import { slykGet, slykList } from './slyk.js';
import { buildLevelRewards } from './levels.js';

const PAYSPACE_ORIGIN = process.env.SLYK_PAYSPACE_ORIGIN || 'https://naval.slyk.io';

function payspaceUrl(path = '/') {
  return `${PAYSPACE_ORIGIN.replace(/\/$/, '')}${path}`;
}

function dashboardUrl(path = '') {
  const base = payspaceUrl('/dashboard');
  return path ? `${base}${path.startsWith('/') ? path : `/${path}`}` : base;
}

function formatAmount(raw, asset) {
  if (raw == null || raw === '') return null;
  const n = Number.parseFloat(String(raw));
  if (Number.isNaN(n)) return String(raw);
  const decimals = asset?.decimalPlacesToDisplay ?? asset?.decimalPlaces ?? 0;
  const formatted = decimals > 0 ? n.toFixed(decimals) : String(Math.round(n));
  const symbol = asset?.symbol || asset?.code?.toUpperCase() || '';
  return symbol ? `${formatted} ${symbol}` : formatted;
}

function pickQuestTask(tasks) {
  const envId = process.env.NAVAL_QUEST_TASK_ID;
  if (envId) {
    const match = tasks.find((t) => t.id === envId);
    if (match) return match;
  }

  const navalUrlMatch = tasks.find((t) => {
    const url = t.surveyUrl || '';
    return /naval/i.test(url) || /naval-quest/i.test(url);
  });
  if (navalUrlMatch) return navalUrlMatch;

  const nameMatch = tasks.find((t) => /naval\s*quest/i.test(t.name || ''));
  if (nameMatch) return nameMatch;

  return (
    tasks.find((t) => t.enabled && t.type === 'automatic' && t.amount) ||
    tasks.find((t) => t.enabled && t.amount && t.surveyUrl) ||
    null
  );
}

function plainText(markdown) {
  if (!markdown) return '';
  return markdown
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();
}

function isFundRaiseProduct(product) {
  if (!product) return false;
  return product.typeCode === 'fund_raise' || product.goal != null || product.raised != null;
}

function pickFundProduct(products) {
  const envId = process.env.NAVAL_FUND_PRODUCT_ID;
  if (envId) {
    const match = products.find((p) => p.id === envId);
    if (match) return match;
  }

  return (
    products.find((p) => /fund naval quest/i.test(p.name || '')) ||
    products.find((p) => /donate/i.test(p.name || '')) ||
    products.find((p) => isFundRaiseProduct(p)) ||
    products.find((p) => p.typeCode === 'service' && /fund|pool|prize/i.test(p.name || '')) ||
    null
  );
}

export async function getPayspaceSnapshot(slug = 'naval', userId = null) {
  const [settings, products, tasks, fundRaiseList] = await Promise.all([
    slykList('/settings', { page: 1, size: 100 }).catch(() => []),
    slykList('/products', { page: 1, size: 50 }).catch(() => []),
    slykList('/tasks', {
      page: 1,
      size: 100,
      filters: [{ name: 'enabled', value: 'true' }],
    }).catch(() => []),
    slykList('/products', {
      page: 1,
      size: 5,
      filters: [{ name: 'typeCode', value: 'fund_raise' }],
    }).catch(() => []),
  ]);

  const setting = (code) => settings.find((s) => s.code === code)?.value ?? null;
  const rewardCode = setting('defaultBonusAssetCode') || 'nvl';
  const masterWalletId = setting('masterWalletId');

  let rewardAsset = { code: rewardCode, symbol: rewardCode.toUpperCase(), decimalPlaces: 0 };
  try {
    rewardAsset = await slykGet(`/assets/${rewardCode}`);
  } catch {
    /* use fallback */
  }

  const fundRaise = fundRaiseList.find(isFundRaiseProduct) ?? null;
  const fundProduct = pickFundProduct(products);
  const questTask = pickQuestTask(tasks);
  const levelRewards = buildLevelRewards(tasks, rewardAsset);

  const referralEarnEnabled = setting('referralEarnBonusEnabled') === true || setting('referralEarnBonusEnabled') === 'True';
  const referralEarnPct = setting('referralEarnBonusPercentage');
  const referralPurchaseEnabled = setting('referralPurchaseBonusEnabled') === true || setting('referralPurchaseBonusEnabled') === 'True';
  const referralPurchasePct = setting('referralPurchaseBonusPercentage');

  let invite = null;
  if (userId) {
    try {
      const user = await slykGet(`/users/${userId}`);
      const code = user.referralCode;
      if (code) {
        const gameOrigin = process.env.NAVAL_GAME_ORIGIN || PAYSPACE_ORIGIN;
        invite = {
          referralCode: code,
          gameUrl: `${gameOrigin.replace(/\/$/, '')}/?slug=${slug}&referral=${code}`,
          payspaceUrl: payspaceUrl(`/?referral=${code}`),
          shortUrl: payspaceUrl(`/i/${code}`),
        };
      }
    } catch {
      /* user not found */
    }
  }

  const prizePool = fundRaise
    ? {
        kind: 'fund_raise',
        id: fundRaise.id,
        name: fundRaise.name,
        description: plainText(fundRaise.description),
        goal: fundRaise.goal,
        raised: fundRaise.raised,
        goalLabel: formatAmount(fundRaise.goal, rewardAsset),
        raisedLabel: formatAmount(fundRaise.raised, rewardAsset),
        progress:
          fundRaise.goal && Number(fundRaise.goal) > 0
            ? Math.min(100, Math.round((Number(fundRaise.raised || 0) / Number(fundRaise.goal)) * 100))
            : 0,
        fundUrl: payspaceUrl(`/products/${fundRaise.id}`),
      }
    : null;

  const funding = fundProduct
    ? {
        id: fundProduct.id,
        name: fundProduct.name,
        description: plainText(fundProduct.description),
        price: fundProduct.price,
        priceLabel: formatAmount(fundProduct.price, rewardAsset),
        typeCode: fundProduct.typeCode,
        fundUrl: payspaceUrl(`/products/${fundProduct.id}`),
      }
    : null;

  const quest = questTask
    ? {
        id: questTask.id,
        name: questTask.name,
        description: plainText(questTask.description),
        amount: questTask.amount,
        amountLabel: formatAmount(questTask.amount, rewardAsset),
        playUrl: questTask.surveyUrl || payspaceUrl(`/?taskId=${questTask.id}&slug=${slug}`),
        taskUrl: payspaceUrl(`/tasks/${questTask.id}`),
      }
    : null;

  const featuredTasks = tasks
    .filter((t) => t.enabled && t.amount && t.id !== questTask?.id)
    .slice(0, 4)
    .map((t) => ({
      id: t.id,
      name: t.name,
      amountLabel: formatAmount(t.amount, rewardAsset),
      taskUrl: payspaceUrl(`/tasks/${t.id}`),
    }));

  return {
    slug,
    rewardAsset: {
      code: rewardAsset.code,
      symbol: rewardAsset.symbol,
      decimalPlaces: rewardAsset.decimalPlaces ?? 0,
    },
    prizePool,
    funding,
    quest,
    levelRewards: {
      totalLevels: levelRewards.totalLevels,
      defaultAmountLabel: levelRewards.defaultAmountLabel,
      mappedCount: levelRewards.mapped.length,
      perLevel: levelRewards.mapped,
    },
    referral: {
      earnEnabled: referralEarnEnabled,
      earnPercentage: referralEarnPct ? Number(referralEarnPct) : null,
      purchaseEnabled: referralPurchaseEnabled,
      purchasePercentage: referralPurchasePct ? Number(referralPurchasePct) : null,
    },
    invite,
    tasks: featuredTasks,
    links: {
      payspace: payspaceUrl('/'),
      dashboard: dashboardUrl('?locale=en'),
      addFunds: dashboardUrl('/add-funds'),
      store: payspaceUrl('/products'),
      cashout: payspaceUrl('/dashboard/wallets'),
      app: payspaceUrl('/'),
      masterWalletAddFunds: masterWalletId
        ? dashboardUrl(`/wallets/${masterWalletId}/balance/add-funds`)
        : dashboardUrl('/add-funds'),
    },
  };
}
