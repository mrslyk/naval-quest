#!/usr/bin/env node
/**
 * End-to-end Naval Quest audit: register → play all 39 levels → cashout screen.
 * Usage: node scripts/e2e-full-play.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE = process.argv[2] || 'http://localhost:5173';
const EMAIL = `qa.e2e.${Date.now()}@navalquest.test`;
const PASSWORD = 'NavalQuestQA1!';
const NAME = 'E2E Auditor';

const log = [];
function note(msg, data) {
  const row = { t: new Date().toISOString(), msg, ...(data ? { data } : {}) };
  log.push(row);
  console.log(`• ${msg}${data ? ` ${JSON.stringify(data)}` : ''}`);
}

async function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function solveLevel(page) {
  const level = await page.evaluate(() => window.__currentLevel);
  if (!level) throw new Error('No __currentLevel on window');
  const type = level.type;
  const cfg = level.config;

  const ready = {
    choice: '.choice-btn',
    'tap-sequence': '.tap-btn',
    sort: '.sort-item',
    match: '.match-item.left',
    slider: '#game-slider',
    'partner-pick': '.partner-card',
    compound: '#invest-btn',
    path: '.path-node',
    collect: '.collect-item',
    avoid: '#avoid-arena',
  }[type];
  if (ready) await page.waitForSelector(ready, { timeout: 10000 });

  switch (type) {
    case 'choice': {
      await page.locator('.choice-btn[data-correct="true"]').first().click();
      break;
    }
    case 'tap-sequence': {
      const n = cfg.sequence.length;
      for (let i = 0; i < n; i++) {
        await page.locator(`.tap-btn[data-index="${i}"]`).click();
        await wait(120);
      }
      break;
    }
    case 'sort': {
      for (const item of cfg.items) {
        const src = page.locator(`.sort-item[data-id="${item.id}"]`);
        const dst = page.locator(`.bucket-drop[data-bucket="${item.bucket}"]`);
        await src.dragTo(dst);
        await wait(80);
      }
      break;
    }
    case 'match': {
      for (const right of cfg.right) {
        await page.locator(`.match-item.left[data-id="${right.matchId}"]`).click();
        await wait(60);
        await page.locator(`.match-item.right[data-id="${right.id}"]`).click();
        await wait(80);
      }
      break;
    }
    case 'slider': {
      await page.locator('#game-slider').evaluate((el, target) => {
        el.value = String(target);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }, cfg.target);
      await page.locator('#slider-confirm').click();
      break;
    }
    case 'partner-pick': {
      const id = await page.evaluate(() => {
        const lvl = window.__currentLevel;
        const min = lvl.config.minStats;
        const cards = [...document.querySelectorAll('.partner-card')];
        const hit = cards.find((el) => {
          const int = Number(el.dataset.int);
          const eng = Number(el.dataset.eng);
          const integ = Number(el.dataset.integ);
          return int >= min.intelligence && eng >= min.energy && integ >= min.integrity;
        });
        return hit?.dataset.id || null;
      });
      if (!id) throw new Error('No valid partner card in DOM');
      await page.locator(`.partner-card[data-id="${id}"]`).click();
      break;
    }
    case 'compound': {
      const rounds = cfg.rounds;
      for (let i = 0; i < rounds + 2; i++) {
        if (await page.locator('#btn-next').count()) break;
        const btn = page.locator('#invest-btn');
        if (!(await btn.count()) || (await btn.isDisabled())) break;
        await btn.click();
        await wait(100);
      }
      break;
    }
    case 'path': {
      for (const id of ['n1', 'n2', 'n3', 'n4']) {
        await page.locator(`.path-node[data-id="${id}"]`).click();
        await wait(80);
      }
      break;
    }
    case 'collect': {
      const needed = cfg.requiredCount;
      let got = 0;
      for (const item of cfg.items) {
        if (!item.permissionless) continue;
        await page.locator(`.collect-item[data-id="${item.id}"]`).click();
        got++;
        await wait(80);
        if (got >= needed) break;
      }
      break;
    }
    case 'avoid': {
      const need = cfg.rounds;
      const deadline = Date.now() + 60000;
      while (Date.now() < deadline) {
        if (await page.locator('#btn-next').count()) break;
        const scoreText = await page.locator('#avoid-score').textContent().catch(() => '0');
        if (Number(scoreText) >= need) break;
        const good = page.locator('.avoid-item.good');
        if (await good.count()) {
          await good.first().click({ force: true }).catch(() => {});
          await wait(120);
        } else {
          await wait(60);
        }
      }
      break;
    }
    default:
      throw new Error(`Unknown type ${type}`);
  }

  return { id: level.id, type, title: level.title };
}

async function advanceAfterSuccess(page) {
  await page.waitForSelector('#btn-next, #naval-bonus-skip, .screen--complete', {
    timeout: 25000,
  });
  if (await page.locator('.screen--complete').count()) return 'complete';

  if (await page.locator('#naval-bonus-skip').count()) {
    await dismissBonusIfAny(page);
    await wait(500);
  }

  if (await page.locator('.screen--complete').count()) return 'complete';

  const nextEnabled = page.locator('#btn-next:not([disabled])');
  if (await nextEnabled.count()) {
    await nextEnabled.click();
    // Wait out "Checking for Naval…" (client timeout ~10s) or bonus / next intro
    await page
      .waitForFunction(() => {
        if (document.querySelector('.screen--complete')) return true;
        if (document.querySelector('#naval-bonus-skip')) return true;
        if (document.querySelector('#btn-begin')) return true;
        const next = document.querySelector('#btn-next');
        if (!next) return true;
        if (next.disabled && /Checking/i.test(next.textContent || '')) return false;
        return !next.disabled;
      }, null, { timeout: 20000 })
      .catch(() => {});
    await wait(400);
    if (await page.locator('#naval-bonus-skip').count()) {
      await dismissBonusIfAny(page);
      await wait(500);
    }
  }

  if (await page.locator('.screen--complete').count()) return 'complete';
  return 'next';
}

async function dismissBonusIfAny(page) {
  const skip = page.locator('#naval-bonus-skip');
  if (await skip.count()) {
    note('Skipping Naval AI bonus modal');
    await skip.click();
    await wait(400);
    return true;
  }
  return false;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const apiHits = [];
  page.on('response', async (res) => {
    const url = res.url();
    if (!url.includes('/api/')) return;
    const path = url.replace(BASE, '');
    let body = null;
    try {
      body = await res.json();
    } catch {
      /* ignore */
    }
    if (
      path.includes('/complete') ||
      path.includes('/auth/') ||
      path.includes('/spend') ||
      path.includes('/exchange') ||
      path.includes('/withdraw') ||
      path.includes('/bonus') ||
      path.includes('/progress')
    ) {
      apiHits.push({ path, status: res.status(), body });
    }
  });

  const issues = [];

  try {
    note('Open home', { BASE });
    await page.goto(BASE, { waitUntil: 'networkidle' });

    // Auth gate
    await page.locator('#btn-start').click();
    await page.waitForSelector('#auth-modal', { timeout: 5000 });
    const gateText = await page.locator('#auth-modal').innerText();
    if (!/required to play|create your account|free account/i.test(gateText)) {
      issues.push('Auth modal copy does not clearly require registration');
    }
    note('Auth gate OK');

    // Register
    await page.fill('input[name="name"]', NAME);
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[name="password"]', PASSWORD);
    await page.locator('#auth-form button[type="submit"]').click();
    await page.waitForSelector('#btn-begin, .screen--level, .wallet-bar-bal', { timeout: 20000 });
    note('Registered', { EMAIL });

    // Ensure on a level
    if (!(await page.locator('#btn-begin').count()) && !(await page.locator('#level-canvas').count())) {
      // might still be home after resume — click play
      if (await page.locator('#btn-start').count()) {
        await page.locator('#btn-start').click();
      }
    }

    const rewards = [];
    const seen = new Set();
    for (let i = 0; i < 39; i++) {
      if (await page.locator('.screen--complete').count()) break;

      // Drain leftover success UI from prior level
      if (await page.locator('#btn-next, #naval-bonus-skip').count()) {
        const adv = await advanceAfterSuccess(page);
        if (adv === 'complete') break;
      }

      await page.waitForSelector('#btn-begin, #level-canvas', { timeout: 15000 });

      if (await page.locator('#btn-begin').count()) {
        await page.locator('#btn-begin').click();
        await wait(400);
      }

      await page.waitForFunction(() => window.__currentLevel?.id, null, { timeout: 10000 });
      const levelId = await page.evaluate(() => window.__currentLevel.id);
      if (seen.has(levelId)) {
        note(`Already cleared level ${levelId}, advancing`);
        const adv = await advanceAfterSuccess(page);
        if (adv === 'complete') break;
        continue;
      }

      const solved = await solveLevel(page);
      seen.add(solved.id);
      note(`Solved level ${solved.id}`, { type: solved.type, title: solved.title });

      // Capture latest complete response
      await page.waitForSelector('#btn-next, #naval-bonus-skip, .screen--complete', {
        timeout: 25000,
      });
      const completes = apiHits.filter((h) => h.path.includes('/complete'));
      const last = completes[completes.length - 1];
      if (last) {
        rewards.push({
          level: solved.id,
          status: last.status,
          amountLabel: last.body?.amountLabel,
          alreadyClaimed: last.body?.alreadyClaimed,
          error: last.body?.error,
        });
        if (last.status >= 400) {
          issues.push(`Level ${solved.id} reward failed: ${last.body?.error || last.status}`);
        }
      } else {
        issues.push(`Level ${solved.id}: no /api/complete observed`);
      }

      const adv = await advanceAfterSuccess(page);
      if (adv === 'complete') break;
    }

    // Wallet check
    await wait(1500);
    const me = await page.evaluate(async () => {
      const r = await fetch('/api/auth/me', { credentials: 'include' });
      return r.json();
    });
    note('Final wallet', { nav: me.nav, navLabel: me.navLabel, balances: me.balances });

    const navNum = Number(me.nav || 0);
    // Sum of 10..48 = 39*10 + (0+..+38) = 390 + 741 = 1131 if all unique claims
    const expectedMin = 10; // at least some rewards
    if (!(navNum >= expectedMin)) {
      issues.push(`Expected NAV >= ${expectedMin}, got ${navNum}`);
    }

    // Progress
    const progress = await page.evaluate(async () => {
      const r = await fetch('/api/progress', { credentials: 'include' });
      return r.json();
    });
    note('Server progress', progress);
    if ((progress.levelsCleared || 0) < 39) {
      issues.push(`Server progress ${progress.levelsCleared} < 39`);
    }

    // Complete screen / cashout
    if (await page.locator('.screen--complete').count()) {
      note('Journey complete screen visible');
      await page.locator('#btn-cashout-final').click();
      await page.waitForSelector('#exchange-form, #btn-auth-signup', { timeout: 10000 });
      note('Cashout page reached');
      if (!(await page.locator('#exchange-form').count())) {
        issues.push('Cashout page missing exchange form while signed in');
      }
    } else {
      // Navigate home → cashout
      issues.push('Did not land on journey complete screen after 39 levels');
      if (await page.locator('#nav-cashout').count()) {
        await page.locator('#nav-cashout').click();
      }
    }

    // Try exchange of 1 NAV (won't withdraw without BTC address / completion gate)
    if (await page.locator('#exchange-form').count()) {
      await page.fill('input[name="amount"]', '1');
      await page.locator('#exchange-form button[type="submit"]').click();
      await wait(3000);
      const ex = apiHits.filter((h) => h.path.includes('/exchange')).pop();
      note('Exchange attempt', ex || { missing: true });
      if (ex && ex.status >= 400) {
        issues.push(`Exchange failed: ${ex.body?.error || ex.status}`);
      }
    }

    // Email: fund-intent / resend — probe config
    const fundProbe = await page.evaluate(async () => {
      const r = await fetch('/api/payment-methods', { credentials: 'include' });
      return { status: r.status, body: await r.json().catch(() => null) };
    });
    note('Payment methods (legacy fund)', fundProbe);

    // Podcast timestamp on a level (spot check via API data in page)
    await page.goto(BASE);
    await wait(800);
    if (await page.locator('#btn-start').count()) {
      await page.locator('#btn-start').click();
      await wait(500);
    }
    if (await page.locator('#btn-begin').count()) {
      // already past intro maybe
    }
    const podcastStamp = await page.locator('.podcast-time').first().textContent().catch(() => null);
    note('Podcast timestamp UI', { podcastStamp });
    if (!podcastStamp || !/\d/.test(podcastStamp)) {
      issues.push('Podcast timestamp missing on level intro');
    }

    const summary = {
      email: EMAIL,
      levelsAttempted: rewards.length,
      rewards,
      finalNav: me.navLabel,
      progress,
      issues,
      apiSample: apiHits.slice(-15),
    };
    writeFileSync('/tmp/naval-e2e-report.json', JSON.stringify(summary, null, 2));
    note('Wrote /tmp/naval-e2e-report.json');

    console.log('\n===== E2E SUMMARY =====');
    console.log(`Levels rewarded: ${rewards.length}/39`);
    console.log(`Final wallet: ${me.navLabel}`);
    console.log(`Progress: ${progress.levelsCleared}`);
    console.log(`Issues (${issues.length}):`);
    issues.forEach((i) => console.log(`  - ${i}`));
    if (issues.length) process.exitCode = 2;
  } catch (err) {
    note('FATAL', { error: String(err), stack: err.stack });
    await page.screenshot({ path: '/tmp/naval-e2e-fail.png', fullPage: true }).catch(() => {});
    writeFileSync('/tmp/naval-e2e-report.json', JSON.stringify({ log, issues, error: String(err) }, null, 2));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
