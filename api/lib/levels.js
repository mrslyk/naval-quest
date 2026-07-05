/**
 * Maps Naval Quest levels (1–39) to Slyk automatic tasks.
 */

const TOTAL_LEVELS = 39;

function parseEnvLevelTasks() {
  const raw = process.env.NAVAL_LEVEL_TASKS;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function levelFromTask(task) {
  const name = task.name || '';
  const nameMatch = name.match(/level\s*[#:]?\s*(\d+)/i) || name.match(/·\s*(\d+)\s*$/);
  if (nameMatch) return Number(nameMatch[1]);

  const url = task.surveyUrl || '';
  const urlMatch = url.match(/[?&]level=(\d+)/i);
  if (urlMatch) return Number(urlMatch[1]);

  const meta = task.metadata?.level ?? task.customData?.level;
  if (meta != null) return Number(meta);

  return null;
}

export function buildLevelRewards(tasks, rewardAsset) {
  const envMap = parseEnvLevelTasks() || {};
  const byLevel = {};

  for (const task of tasks) {
    if (!task.enabled || task.type !== 'automatic') continue;

    const level = envMap[task.id] ? Number(envMap[task.id]) : levelFromTask(task);
    if (!level || level < 1 || level > TOTAL_LEVELS) continue;

    byLevel[level] = {
      level,
      taskId: task.id,
      name: task.name,
      amount: task.amount,
      amountLabel: formatAmount(task.amount, rewardAsset),
    };
  }

  for (const [level, taskId] of Object.entries(envMap)) {
    const n = Number(level);
    if (byLevel[n]) continue;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) continue;
    byLevel[n] = {
      level: n,
      taskId: task.id,
      name: task.name,
      amount: task.amount,
      amountLabel: formatAmount(task.amount, rewardAsset),
    };
  }

  const defaultAmount = process.env.NAVAL_LEVEL_REWARD_AMOUNT || null;
  const defaultLabel = defaultAmount ? formatAmount(defaultAmount, rewardAsset) : null;

  return {
    totalLevels: TOTAL_LEVELS,
    defaultAmount,
    defaultAmountLabel: defaultLabel,
    mapped: Object.values(byLevel).sort((a, b) => a.level - b.level),
    byLevel,
  };
}

export function resolveLevelTaskId(levelRewards, level) {
  const n = Number(level);
  if (levelRewards?.byLevel?.[n]?.taskId) {
    return levelRewards.byLevel[n].taskId;
  }
  return null;
}

export function rewardLabelForLevel(levelRewards, level) {
  const n = Number(level);
  const mapped = levelRewards?.byLevel?.[n];
  if (mapped?.amountLabel) return mapped.amountLabel;
  return levelRewards?.defaultAmountLabel ?? null;
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
