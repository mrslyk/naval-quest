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

/** Official tweetstorm text (@naval / nav.al/rich). */
const CANONICAL_TWEETS = [
  'Seek wealth, not money or status. Wealth is having assets that earn while you sleep. Money is how we transfer time and wealth. Status is your place in the social hierarchy.',
  'Understand that ethical wealth creation is possible. If you secretly despise wealth, it will elude you.',
  'Ignore people playing status games. They gain status by attacking people playing wealth creation games.',
  "You're not going to get rich renting out your time. You must own equity — a piece of a business — to gain your financial freedom.",
  'You will get rich by giving society what it wants but does not yet know how to get. At scale.',
  'Pick an industry where you can play long-term games with long-term people.',
  "The Internet has massively broadened the possible space of careers. Most people haven't figured this out yet.",
  'Play iterated games. All the returns in life, whether in wealth, relationships, or knowledge, come from compound interest.',
  'Pick business partners with high intelligence, energy, and, above all, integrity.',
  "Don't partner with cynics and pessimists. Their beliefs are self-fulfilling.",
  'Learn to sell. Learn to build. If you can do both, you will be unstoppable.',
  'Arm yourself with specific knowledge, accountability, and leverage.',
  'Specific knowledge is knowledge that you cannot be trained for. If society can train you, it can train someone else, and replace you.',
  'Specific knowledge is found by pursuing your genuine curiosity and passion rather than whatever is hot right now.',
  'Building specific knowledge will feel like play to you but will look like work to others.',
  "When specific knowledge is taught, it's through apprenticeships, not schools.",
  'Specific knowledge is often highly technical or creative. It cannot be outsourced or automated.',
  'Embrace accountability, and take business risks under your own name. Society will reward you with responsibility, equity, and leverage.',
  'Fortunes require leverage. Business leverage comes from capital, people, and products with no marginal cost of replication (code and media).',
  'Capital means money. To raise money, apply your specific knowledge, with accountability, and show resulting good judgment.',
  "Labor means people working for you. It's the oldest and most fought-over form of leverage. Labor leverage will impress your parents, but don't waste your life chasing it.",
  'Capital and labor are permissioned leverage. Everyone is chasing capital, but someone has to give it to you. Everyone is trying to lead, but someone has to follow you.',
  "Code and media are permissionless leverage. They're the leverage behind the newly rich. You can create software and media that works for you while you sleep.",
  "An army of robots is freely available — it's just packed in data centers for heat and space efficiency. Use it.",
  "If you can't code, write books and blogs, record videos and podcasts.",
  'Leverage is a force multiplier for your judgment.',
  'Judgment requires experience, but can be built faster by learning foundational skills.',
  'There is no skill called "business." Avoid business magazines and business classes.',
  'Study microeconomics, game theory, psychology, persuasion, ethics, mathematics, and computers.',
  'Reading is faster than listening. Doing is faster than watching.',
  'You should be too busy to "do coffee," while still keeping an uncluttered calendar.',
  'Set and enforce an aspirational personal hourly rate. If fixing a problem will save less than your hourly rate, ignore it. If outsourcing a task will cost less than your hourly rate, outsource it.',
  'Work as hard as you can. Even though who you work with and what you work on are more important than how hard you work.',
  'Become the best in the world at what you do. Keep redefining what you do until this is true.',
  "There are no get rich quick schemes. That's just someone else getting rich off you.",
  'Apply specific knowledge, with leverage, and eventually you will get what you deserve.',
  'Productize yourself. Find what feels like play to you but looks like work to others, and build leverage around it.',
  "When you're finally wealthy, you'll realize that it wasn't what you were seeking in the first place. But that's for another day.",
];

/** Game level 1–39 → parsed nav.al/rich section index. */
const LEVEL_SECTION_INDEX = [
  0, 1, 0, 5, 7, 9, 8, 9, 10, 11, 14, 12, 13, 13, 13, 13, 18, 20, 21, 19, 20, 21, 21, 22, 22, 25, 25, 17, 16, 15, 28,
  26, 27, 29, 32, 35, 33, 36, 34,
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
