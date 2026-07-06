#!/usr/bin/env node
/**
 * Fetch https://nav.al/rich and generate src/data/naval-rich.ts
 * Run: node scripts/sync-naval-rich.mjs
 */
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../src/data/naval-rich.ts');
const SOURCE_URL = 'https://nav.al/rich';

/**
 * Official tweetstorm text (@naval / nav.al/rich) in GAME LEVEL ORDER (1–39).
 * The game's level sequence diverges from the raw thread order after level 15,
 * so this list must stay aligned with src/data/tweets.ts + tweets-extra.ts.
 */
const CANONICAL_TWEETS = [
  /* 1 */ 'Seek wealth, not money or status. Wealth is having assets that earn while you sleep. Money is how we transfer time and wealth. Status is your place in the social hierarchy.',
  /* 2 */ 'Understand that ethical wealth creation is possible. If you secretly despise wealth, it will elude you.',
  /* 3 */ 'Ignore people playing status games. They gain status by attacking people playing wealth creation games.',
  /* 4 */ "You're not going to get rich renting out your time. You must own equity — a piece of a business — to gain your financial freedom.",
  /* 5 */ 'You will get rich by giving society what it wants but does not yet know how to get. At scale.',
  /* 6 */ 'Pick an industry where you can play long-term games with long-term people.',
  /* 7 */ "The Internet has massively broadened the possible space of careers. Most people haven't figured this out yet.",
  /* 8 */ 'Play iterated games. All the returns in life, whether in wealth, relationships, or knowledge, come from compound interest.',
  /* 9 */ 'Pick business partners with high intelligence, energy, and, above all, integrity.',
  /* 10 */ "Don't partner with cynics and pessimists. Their beliefs are self-fulfilling.",
  /* 11 */ 'Learn to sell. Learn to build. If you can do both, you will be unstoppable.',
  /* 12 */ 'Arm yourself with specific knowledge, accountability, and leverage.',
  /* 13 */ 'Specific knowledge is knowledge that you cannot be trained for. If society can train you, it can train someone else, and replace you.',
  /* 14 */ 'Specific knowledge is found by pursuing your genuine curiosity and passion rather than whatever is hot right now.',
  /* 15 */ 'Building specific knowledge will feel like play to you but will look like work to others.',
  /* 16 */ 'Embrace accountability, and take business risks under your own name. Society will reward you with responsibility, equity, and leverage.',
  /* 17 */ 'Fortunes require leverage. Business leverage comes from capital, people, and products with no marginal cost of replication (code and media).',
  /* 18 */ "Code and media are permissionless leverage. They're the leverage behind the newly rich. You can create software and media that works for you while you sleep.",
  /* 19 */ 'Set and enforce an aspirational personal hourly rate. If fixing a problem will save less than your hourly rate, ignore it. If outsourcing a task will cost less than your hourly rate, outsource it.',
  /* 20 */ 'Become the best in the world at what you do. Keep redefining what you do until this is true.',
  /* 21 */ 'Capital means money. To raise money, apply your specific knowledge, with accountability, and show resulting good judgment.',
  /* 22 */ "Labor means people working for you. It's the oldest and most fought-over form of leverage. Labor leverage will impress your parents, but don't waste your life chasing it.",
  /* 23 */ 'Capital and labor are permissioned leverage. Everyone is chasing capital, but someone has to give it to you. Everyone is trying to lead, but someone has to follow you.',
  /* 24 */ "Code and media are permissionless leverage. They're the leverage behind the newly rich. You can create software and media that works for you while you sleep.",
  /* 25 */ "An army of robots is freely available — it's just packed in data centers for heat and space efficiency. Use it.",
  /* 26 */ "If you can't code, write books and blogs, record videos and podcasts.",
  /* 27 */ 'Leverage is a force multiplier for your judgment.',
  /* 28 */ 'Judgment requires experience, but can be built faster by learning foundational skills.',
  /* 29 */ 'There is no skill called "business." Avoid business magazines and business classes.',
  /* 30 */ 'Study microeconomics, game theory, psychology, persuasion, ethics, mathematics, and computers.',
  /* 31 */ 'Reading is faster than listening. Doing is faster than watching.',
  /* 32 */ 'You should be too busy to "do coffee," while still keeping an uncluttered calendar.',
  /* 33 */ 'Set and enforce an aspirational personal hourly rate. If fixing a problem will save less than your hourly rate, ignore it. If outsourcing a task will cost less than your hourly rate, outsource it.',
  /* 34 */ 'Work as hard as you can. Even though who you work with and what you work on are more important than how hard you work.',
  /* 35 */ 'Become the best in the world at what you do. Keep redefining what you do until this is true.',
  /* 36 */ "There are no get rich quick schemes. That's just someone else getting rich off you.",
  /* 37 */ 'Apply specific knowledge, with leverage, and eventually you will get what you deserve.',
  /* 38 */ 'Productize yourself. Find what feels like play to you but looks like work to others, and build leverage around it.',
  /* 39 */ "When you're finally wealthy, you'll realize that it wasn't what you were seeking in the first place. But that's for another day.",
];

/** Game level 1–39 → parsed nav.al/rich section index (also game level order). */
const LEVEL_SECTION_INDEX = [
  /* 1 */ 0,
  /* 2 */ 1,
  /* 3 */ 0,
  /* 4 */ 5,
  /* 5 */ 7,
  /* 6 */ 9,
  /* 7 */ 8,
  /* 8 */ 9,
  /* 9 */ 10,
  /* 10 */ 11,
  /* 11 */ 14,
  /* 12 */ 12,
  /* 13 */ 13,
  /* 14 */ 13,
  /* 15 */ 13,
  /* 16 */ 18,
  /* 17 */ 20,
  /* 18 */ 21,
  /* 19 */ 26,
  /* 20 */ 29,
  /* 21 */ 20,
  /* 22 */ 20,
  /* 23 */ 21,
  /* 24 */ 21,
  /* 25 */ 22,
  /* 26 */ 22,
  /* 27 */ 25,
  /* 28 */ 25,
  /* 29 */ 17,
  /* 30 */ 16,
  /* 31 */ 15,
  /* 32 */ 28,
  /* 33 */ 26,
  /* 34 */ 27,
  /* 35 */ 29,
  /* 36 */ 35,
  /* 37 */ 32,
  /* 38 */ 36,
  /* 39 */ 34,
];

function decodeHtml(text) {
  return text
    .replace(/&#8217;|&#8216;|&rsquo;|&lsquo;/g, "'")
    .replace(/&#8220;|&ldquo;/g, '"')
    .replace(/&#8221;|&rdquo;/g, '"')
    .replace(/&#8212;|&mdash;/g, '—')
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripTags(html) {
  return decodeHtml(html);
}

function parseSections(html) {
  const entryMatch = html.match(/class="entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<footer/i);
  const body = entryMatch ? entryMatch[1] : html;
  const parts = body.split(/<h2[^>]*>/i);
  const sections = [];

  for (const part of parts.slice(1, 53)) {
    const titleMatch = part.match(/^([^<]+)<\/h2>/i);
    if (!titleMatch) continue;
    const title = stripTags(titleMatch[1]);
    const chunk = part.slice(titleMatch[0].length);

    const taglines = [];
    for (const m of chunk.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)) {
      const t = stripTags(m[1]);
      if (t.length > 8 && t.length < 160) taglines.push(t);
    }
    for (const m of chunk.matchAll(/<p>\s*<em>([\s\S]*?)<\/em>\s*<\/p>/gi)) {
      const t = stripTags(m[1]);
      if (t.length > 8 && t.length < 160) taglines.push(t);
    }
    for (const m of chunk.matchAll(/<strong>([\s\S]*?)<\/strong>/gi)) {
      const t = stripTags(m[1]);
      if (t.length > 8 && t.length < 120 && !/^Naval:/i.test(t) && !/^Nivi:/i.test(t)) {
        taglines.push(t);
      }
    }

    const QUOTED = /[\u201C\u201D""]([^\u201C\u201D""]{15,}?)[\u201C\u201D""]/g;

    function pullQuotedTweets(text) {
      const out = [];
      for (const q of text.matchAll(QUOTED)) {
        const t = q[1].trim();
        if (t.length >= 15) out.push(t);
      }
      return out;
    }
    const navalQuotes = [];
    const niviQuotes = [];
    const tweetQuotes = [];

    for (const m of chunk.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
      const inner = m[1];
      const plain = stripTags(inner);
      if (!plain || plain.length < 35) continue;

      const isNaval = /<b>\s*Naval\s*:\s*<\/b>/i.test(inner) || /^Naval:/i.test(plain);
      const isNivi = /<b>\s*Nivi\s*:\s*<\/b>/i.test(inner) || /^Nivi:/i.test(plain);

      if (isNaval) {
        const text = plain.replace(/^Naval:\s*/i, '').trim();
        if (text.length > 35) navalQuotes.push(text);
        tweetQuotes.push(...pullQuotedTweets(text));
      } else if (isNivi) {
        const text = plain.replace(/^Nivi:\s*/i, '').trim();
        if (text.length > 35) niviQuotes.push(text);
        tweetQuotes.push(...pullQuotedTweets(text));
      }
    }

    sections.push({
      title,
      taglines: [...new Set(taglines)].slice(0, 6),
      navalQuotes: navalQuotes.slice(0, 5),
      niviQuotes: niviQuotes.slice(0, 3),
      tweetQuotes: tweetQuotes.slice(0, 3),
    });
  }

  return sections;
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  console.log('Fetching', SOURCE_URL);
  const res = await fetch(SOURCE_URL, {
    headers: { 'User-Agent': 'NavalQuest/1.0 (sync script; educational tribute)' },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const html = await res.text();
  const sections = parseSections(html);
  if (sections.length < 40) {
    throw new Error(`Expected ~52 sections, got ${sections.length}`);
  }
  console.log(`Parsed ${sections.length} sections from nav.al/rich`);
  if (process.env.DEBUG_SECTIONS) {
    sections.forEach((s, i) => console.log(`  [${i}] ${s.title}`));
  }

  const levels = CANONICAL_TWEETS.map((tweet, idx) => {
    const level = idx + 1;
    const sectionIdx = LEVEL_SECTION_INDEX[idx] ?? 0;
    const section = sections[sectionIdx] ?? sections[0];
    const anchor = `#${slugify(section.title)}`;

    return {
      level,
      tweet,
      sectionTitle: section.title,
      sectionIndex: sectionIdx,
      navAlAnchor: anchor,
      taglines: section.taglines,
      navalQuotes: section.navalQuotes.slice(0, 3),
      niviQuotes: section.niviQuotes.slice(0, 2),
      tweetQuotesFromDialogue: section.tweetQuotes,
    };
  });

  const ts = `/**
 * AUTO-GENERATED by scripts/sync-naval-rich.mjs — do not edit by hand.
 * Source: ${SOURCE_URL}
 * Synced: ${new Date().toISOString()}
 */

export const NAVAL_RICH_SOURCE_URL = '${SOURCE_URL}';

export interface NavalRichLevel {
  level: number;
  tweet: string;
  sectionTitle: string;
  sectionIndex: number;
  navAlAnchor: string;
  taglines: string[];
  navalQuotes: string[];
  niviQuotes: string[];
  tweetQuotesFromDialogue: string[];
}

export const NAVAL_RICH_LEVELS: NavalRichLevel[] = ${JSON.stringify(levels, null, 2)};

export function getNavalRichLevel(levelId: number): NavalRichLevel | undefined {
  return NAVAL_RICH_LEVELS.find((l) => l.level === levelId);
}

export function getCanonicalTweet(levelId: number): string | undefined {
  return getNavalRichLevel(levelId)?.tweet;
}

export function navAlSectionUrl(levelId: number): string {
  const row = getNavalRichLevel(levelId);
  if (!row) return NAVAL_RICH_SOURCE_URL;
  return \`\${NAVAL_RICH_SOURCE_URL}\${row.navAlAnchor}\`;
}
`;

  writeFileSync(OUT, ts);
  console.log('Wrote', OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
