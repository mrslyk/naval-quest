#!/usr/bin/env node
/**
 * Generate branded SVG reward images for Slyk tasks + NAV asset logo.
 * Output: public/rewards/level-XX.svg, public/rewards/nav-logo.svg
 *
 * Run: npm run sync:rewards
 */
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/rewards');
const TOTAL = 39;
const BASE = Number(process.env.NAVAL_LEVEL_REWARD_AMOUNT || '10');
const STEP = Number(process.env.NAVAL_LEVEL_REWARD_STEP || '1');

function amountFor(level) {
  return BASE + (level - 1) * STEP;
}

function bandColor(level) {
  if (level <= 13) return '#6aaa64'; // easy — Wordle green
  if (level <= 26) return '#c9b458'; // medium — Wordle yellow
  return '#787c7e'; // hard — Wordle gray
}

function levelSvg(level) {
  const amount = amountFor(level);
  const accent = bandColor(level);
  const label = String(level).padStart(2, '0');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="48" fill="#ffffff"/>
  <rect x="32" y="32" width="448" height="448" rx="32" fill="#f6f7f8" stroke="#d3d6da" stroke-width="4"/>
  <text x="256" y="110" text-anchor="middle" fill="#1a1a1b" font-family="Helvetica, Arial, sans-serif" font-size="28" font-weight="700" letter-spacing="4">NAVAL QUEST</text>
  <rect x="176" y="140" width="160" height="160" rx="16" fill="${accent}"/>
  <text x="256" y="238" text-anchor="middle" fill="#ffffff" font-family="Helvetica, Arial, sans-serif" font-size="72" font-weight="700">${level}</text>
  <text x="256" y="360" text-anchor="middle" fill="#565758" font-family="Helvetica, Arial, sans-serif" font-size="26">Level ${label}</text>
  <text x="256" y="420" text-anchor="middle" fill="#1a1a1b" font-family="Helvetica, Arial, sans-serif" font-size="44" font-weight="700">+${amount} NAV</text>
  <text x="256" y="460" text-anchor="middle" fill="#878a8c" font-family="Helvetica, Arial, sans-serif" font-size="18">Clear to earn</text>
</svg>
`;
}

function navLogoSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="96" fill="#1a1a1b"/>
  <rect x="96" y="96" width="320" height="320" rx="40" fill="#6aaa64"/>
  <text x="256" y="290" text-anchor="middle" fill="#ffffff" font-family="Helvetica, Arial, sans-serif" font-size="120" font-weight="700">N</text>
  <text x="256" y="380" text-anchor="middle" fill="#ffffff" font-family="Helvetica, Arial, sans-serif" font-size="36" font-weight="700" letter-spacing="6">NAV</text>
</svg>
`;
}

mkdirSync(OUT, { recursive: true });
for (let level = 1; level <= TOTAL; level++) {
  const name = `level-${String(level).padStart(2, '0')}.svg`;
  writeFileSync(join(OUT, name), levelSvg(level));
}
writeFileSync(join(OUT, 'nav-logo.svg'), navLogoSvg());
console.log(`Wrote ${TOTAL} level images + nav-logo.svg → ${OUT}`);
