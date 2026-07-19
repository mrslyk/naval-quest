#!/usr/bin/env node
/**
 * Sync Naval Quest level reward amounts (+ descriptions) onto Slyk automatic tasks.
 *
 * Requires SLYK_API_KEY (from .env or environment).
 *
 * Usage:
 *   npm run sync:rewards   # generate public/rewards/*.svg
 *   npm run sync:slyk      # PATCH amounts + descriptions
 *   npm run sync:slyk -- --dry-run
 *
 * What the API can do:
 *   ✓ PATCH /tasks/:id { amount, description } — works for automatic tasks
 *   ✓ PATCH /assets/nvl { logo } — NAV wallet asset logo (public URL)
 *   ✗ PATCH /tasks/:id { image, thumbnail } — rejected for type=automatic
 *     (Slyk schema: additionalProperties — images only for system/manual tasks)
 *
 * Manual images (required for level tasks in the dashboard/wallet):
 *   1. Deploy so https://navalgame.netlify.app/rewards/level-XX.svg exists
 *   2. Open Slyk admin for naval → Tasks
 *   3. For each "Naval Quest — Level N" task → Edit → Image / Thumbnail
 *   4. Upload the matching SVG (or PNG export) from public/rewards/
 *      Or paste: https://navalgame.netlify.app/rewards/level-NN.svg
 *   5. Confirm Assets → NAV (nvl) logo already points at
 *      https://navalgame.netlify.app/rewards/nav-logo.svg (set by this script)
 *
 * Amount schedule: amount = base + (level-1)*step (default 10 + (N-1)*1 → L1=10 … L39=48)
 */
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function loadEnvFile() {
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = val;
  }
}

loadEnvFile();

const DRY = process.argv.includes('--dry-run');
const TOTAL = 39;
const API_KEY = process.env.SLYK_API_KEY;
const HOST = process.env.SLYK_API_HOST || 'api.slyk.io';
const ASSET = process.env.NAVAL_REWARD_ASSET || 'nvl';
const SYMBOL = process.env.NAVAL_REWARD_SYMBOL || 'NAV';
const BASE = Number(process.env.NAVAL_LEVEL_REWARD_AMOUNT || '10');
const STEP = Number(process.env.NAVAL_LEVEL_REWARD_STEP || '1');

function resolvePublicBase() {
  const raw = (
    process.env.NAVAL_PUBLIC_ASSET_BASE ||
    process.env.NAVAL_GAME_ORIGIN ||
    'https://navalgame.netlify.app'
  ).replace(/\/$/, '');
  if (/localhost|127\.0\.0\.1/.test(raw)) {
    return 'https://navalgame.netlify.app';
  }
  return raw;
}
const PUBLIC_BASE = resolvePublicBase();

function amountFor(level) {
  return BASE + (level - 1) * STEP;
}

function imageUrl(level) {
  return `${PUBLIC_BASE}/rewards/level-${String(level).padStart(2, '0')}.svg`;
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

async function slyk(method, path, body) {
  const url = `https://${HOST}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      apikey: API_KEY,
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    const msg =
      json?.message || json?.code || text || `${method} ${path} → ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json?.data ?? json;
}

async function listAllTasks() {
  const all = [];
  let page = 1;
  for (;;) {
    const params = new URLSearchParams({
      'page[number]': String(page),
      'page[size]': '100',
    });
    const data = await slyk('GET', `/tasks?${params}`);
    const batch = Array.isArray(data) ? data : [];
    all.push(...batch);
    if (batch.length < 100) break;
    page += 1;
    if (page > 20) break;
  }
  return all;
}

async function main() {
  if (!API_KEY) {
    console.error('SLYK_API_KEY missing. Set it in .env or the environment.');
    console.error('Manual image steps: see header comment in this script.');
    process.exit(1);
  }

  console.log(`Public asset base: ${PUBLIC_BASE}`);
  console.log(
    `Reward schedule: base=${BASE} step=${STEP} → L1=${amountFor(1)} … L${TOTAL}=${amountFor(TOTAL)} ${SYMBOL}`
  );
  console.log(
    'Note: automatic tasks cannot set image/thumbnail via API — set those in the Slyk dashboard.'
  );
  if (DRY) console.log('DRY RUN — no PATCH calls\n');

  const tasks = await listAllTasks();
  const automatic = tasks.filter((t) => t.type === 'automatic' && t.enabled !== false);
  const byLevel = {};

  for (const task of automatic) {
    const level = levelFromTask(task);
    if (!level || level < 1 || level > TOTAL) continue;
    byLevel[level] = task;
  }

  const mapped = Object.keys(byLevel)
    .map(Number)
    .sort((a, b) => a - b);
  console.log(`Found ${mapped.length}/${TOTAL} level tasks (${automatic.length} automatic tasks total)`);

  if (mapped.length === 0) {
    console.error('No level tasks matched. Ensure task names contain "Level N" or ?level=N.');
    process.exit(1);
  }

  let ok = 0;
  let fail = 0;
  const missing = [];

  for (let level = 1; level <= TOTAL; level++) {
    const task = byLevel[level];
    if (!task) {
      missing.push(level);
      continue;
    }
    const amount = String(amountFor(level));
    const description = `Clear level ${level} of Naval Quest · +${amount} ${SYMBOL}`;
    const body = { amount, description };
    console.log(`L${level} ${task.id}: amount=${amount}  (image: set manually → ${imageUrl(level)})`);
    if (DRY) {
      ok += 1;
      continue;
    }
    try {
      await slyk('PATCH', `/tasks/${task.id}`, body);
      ok += 1;
    } catch (err) {
      console.error(`  ✗ ${err.message}`);
      fail += 1;
    }
  }

  const logo = `${PUBLIC_BASE}/rewards/nav-logo.svg`;
  console.log(`\nAsset ${ASSET} logo → ${logo}`);
  if (!DRY) {
    try {
      await slyk('PATCH', `/assets/${ASSET}`, { logo });
      console.log('  ✓ asset logo updated');
    } catch (err) {
      console.warn(`  ⚠ could not set asset logo: ${err.message}`);
      console.warn('    Set manually in Slyk → Assets → nvl → Logo');
    }
  }

  if (missing.length) {
    console.warn(`\nMissing tasks for levels: ${missing.join(', ')}`);
  }
  console.log(`\nDone: ${ok} updated, ${fail} failed, ${missing.length} missing`);
  console.log('\nManual task images (API blocked for automatic tasks):');
  console.log('  Slyk admin → Tasks → each Level N → Image/Thumbnail');
  console.log(`  Use ${PUBLIC_BASE}/rewards/level-NN.svg (or upload from public/rewards/)`);
  if (fail) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
