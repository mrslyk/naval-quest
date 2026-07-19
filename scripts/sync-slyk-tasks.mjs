#!/usr/bin/env node
/**
 * Sync Naval Quest level reward amounts + images onto Slyk automatic tasks.
 *
 * Requires SLYK_API_KEY (from .env or environment).
 *
 * Usage:
 *   npm run sync:rewards   # generate public/rewards/*.svg first
 *   npm run sync:slyk      # PATCH amounts + image URLs
 *   npm run sync:slyk -- --dry-run
 *
 * Image URLs point at the deployed game origin so Slyk can fetch them:
 *   {NAVAL_PUBLIC_ASSET_BASE}/rewards/level-XX.svg
 *
 * Also PATCHes the NAV asset logo when possible:
 *   PATCH /assets/{code}  { logo: "…/rewards/nav-logo.svg" }
 *
 * If the API rejects image/logo fields, set images manually in the Slyk dashboard:
 *   1. Open https://naval.slyk.io (admin) → Tasks
 *   2. For each "Level N" automatic task → edit → Image / Thumbnail
 *   3. Upload or paste URL: https://navalgame.netlify.app/rewards/level-NN.svg
 *   4. Assets → nvl (NAV) → Logo → https://navalgame.netlify.app/rewards/nav-logo.svg
 *   5. Set each task Amount to: 10 + (N-1)*step (default step=1 → L1=10 … L39=48)
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
const BASE = Number(process.env.NAVAL_LEVEL_REWARD_AMOUNT || '10');
const STEP = Number(process.env.NAVAL_LEVEL_REWARD_STEP || '1');
function resolvePublicBase() {
  const raw = (
    process.env.NAVAL_PUBLIC_ASSET_BASE ||
    process.env.NAVAL_GAME_ORIGIN ||
    'https://navalgame.netlify.app'
  ).replace(/\/$/, '');
  // Slyk must fetch images from a public host — never push localhost URLs.
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
    console.error('Manual fallback: see header comment in this script.');
    process.exit(1);
  }

  console.log(`Public asset base: ${PUBLIC_BASE}`);
  console.log(`Reward schedule: base=${BASE} step=${STEP} → L1=${amountFor(1)} … L${TOTAL}=${amountFor(TOTAL)}`);
  if (DRY) console.log('DRY RUN — no PATCH calls\n');

  const tasks = await listAllTasks();
  const automatic = tasks.filter((t) => t.type === 'automatic' && t.enabled !== false);
  const byLevel = {};

  for (const task of automatic) {
    const level = levelFromTask(task);
    if (!level || level < 1 || level > TOTAL) continue;
    byLevel[level] = task;
  }

  const mapped = Object.keys(byLevel).map(Number).sort((a, b) => a - b);
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
    const image = imageUrl(level);
    const body = { amount, image, thumbnail: image };
    console.log(`L${level} ${task.id}: amount=${amount} image=${image}`);
    if (DRY) {
      ok += 1;
      continue;
    }
    try {
      await slyk('PATCH', `/tasks/${task.id}`, body);
      ok += 1;
    } catch (err) {
      // Retry amount-only if image fields rejected
      if (String(err.message).toLowerCase().includes('image') || err.status === 400) {
        try {
          await slyk('PATCH', `/tasks/${task.id}`, { amount });
          console.warn(`  ⚠ amount OK, image rejected: ${err.message}`);
          ok += 1;
          continue;
        } catch (err2) {
          console.error(`  ✗ ${err2.message}`);
          fail += 1;
          continue;
        }
      }
      console.error(`  ✗ ${err.message}`);
      fail += 1;
    }
  }

  // NAV asset logo
  const logo = `${PUBLIC_BASE}/rewards/nav-logo.svg`;
  console.log(`\nAsset ${ASSET} logo → ${logo}`);
  if (!DRY) {
    try {
      await slyk('PATCH', `/assets/${ASSET}`, { logo });
      console.log('  ✓ asset logo updated');
    } catch (err) {
      try {
        await slyk('PATCH', `/assets/${ASSET}`, { image: logo });
        console.log('  ✓ asset image updated');
      } catch (err2) {
        console.warn(`  ⚠ could not set asset logo: ${err.message}`);
        console.warn('    Set manually in Slyk → Assets → nvl → Logo');
      }
    }
  }

  if (missing.length) {
    console.warn(`\nMissing tasks for levels: ${missing.join(', ')}`);
  }
  console.log(`\nDone: ${ok} updated, ${fail} failed, ${missing.length} missing`);
  if (fail) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
