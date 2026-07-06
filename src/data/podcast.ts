/**
 * Naval × Nivi — "How to Get Rich" mega-episode (3h 36m).
 * Video: https://www.youtube.com/watch?v=1-TZqOsVCNM
 * Transcript: https://nav.al/rich
 */

export const PODCAST_YOUTUBE_ID = '1-TZqOsVCNM';
export const PODCAST_NAV_AL_URL = 'https://nav.al/rich';
export const PODCAST_APPLE_URL =
  'https://podcasts.apple.com/us/podcast/how-to-get-rich-every-episode/id1454097755?i=1000440401437';
export const PODCAST_SPOTIFY_URL = 'https://open.spotify.com/show/7qZAVw03FuurfYnWIWwkHY';
export const PODCAST_APPLE_SHOW_URL = 'https://podcasts.apple.com/us/podcast/naval/id1454097755';

export interface PodcastChapter {
  title: string;
  startSec: number;
}

/** YouTube chapter markers (Naval official upload). */
export const PODCAST_CHAPTERS: PodcastChapter[] = [
  { title: 'Intro', startSec: 0 },
  { title: 'Seek Wealth, Not Money or Status', startSec: 111 },
  { title: 'Make Abundance for the World', startSec: 420 },
  { title: 'Free Markets Are Intrinsic to Humans', startSec: 639 },
  { title: "Making Money Isn't About Luck", startSec: 877 },
  { title: 'Make Luck Your Destiny', startSec: 1181 },
  { title: "You Won't Get Rich Renting Out Your Time", startSec: 1456 },
  { title: 'Live Below Your Means for Freedom', startSec: 1735 },
  { title: "Give Society What It Doesn't Know How to Get", startSec: 1875 },
  { title: 'The Internet Has Massively Broadened Career Possibilities', startSec: 2038 },
  { title: 'Play Long-Term Games With Long-Term People', startSec: 2316 },
  { title: 'Pick Partners With Intelligence, Energy and Integrity', startSec: 2676 },
  { title: 'Partner With Rational Optimists', startSec: 2960 },
  { title: 'Arm Yourself With Specific Knowledge', startSec: 3284 },
  { title: 'Specific Knowledge Is Highly Creative or Technical', startSec: 3664 },
  { title: 'Learn to Sell, Learn to Build', startSec: 3994 },
  { title: 'Read What You Love Until You Love to Read', startSec: 4329 },
  { title: 'The Foundations Are Math and Logic', startSec: 4617 },
  { title: "There's No Actual Skill Called 'Business'", startSec: 4815 },
  { title: 'Embrace Accountability to Get Leverage', startSec: 5145 },
  { title: 'Take Accountability to Earn Equity', startSec: 5413 },
  { title: 'Labor and Capital Are Old Leverage', startSec: 5708 },
  { title: 'Product and Media Are New Leverage', startSec: 5989 },
  { title: 'Product Leverage is Egalitarian', startSec: 6303 },
  { title: 'Pick a Business Model With Leverage', startSec: 6612 },
  { title: 'Example: From Laborer to Entrepreneur', startSec: 6957 },
  { title: 'Judgment Is the Decisive Skill', startSec: 7281 },
  { title: 'Set an Aspirational Hourly Rate', startSec: 7667 },
  { title: 'Work As Hard As You Can', startSec: 7891 },
  { title: 'Be Too Busy to “Do Coffee”', startSec: 8198 },
  { title: 'Keep Redefining What You Do', startSec: 8442 },
  { title: 'Escape Competition Through Authenticity', startSec: 8565 },
  { title: 'Play Stupid Games, Win Stupid Prizes', startSec: 8901 },
  { title: 'Eventually You Will Get What You Deserve', startSec: 9057 },
  { title: 'Reject Most Advice', startSec: 9304 },
  { title: 'A Calm Mind, a Fit Body, a House Full of Love', startSec: 9479 },
  { title: 'There Are No Get Rich Quick Schemes', startSec: 9725 },
  { title: 'Productize Yourself', startSec: 10006 },
  { title: 'Accountability Means Letting People Criticize You', startSec: 10120 },
  { title: 'We Should Eventually Be Working for Ourselves', startSec: 10337 },
  { title: 'Being Ethical Is Long-Term Greedy', startSec: 10602 },
  { title: 'Envy Can Be Useful, or It Can Eat You Alive', startSec: 10807 },
  { title: 'Principal-Agent Problem: Act Like an Owner', startSec: 11016 },
  { title: 'Kelly Criterion: Avoid Ruin', startSec: 11418 },
  { title: 'Schelling Point: Cooperating Without Communicating', startSec: 11519 },
  { title: 'Turn Short-Term Games Into Long-Term Games', startSec: 11619 },
  { title: 'Compounding Relationships Make Life Easier', startSec: 11780 },
  { title: 'Price Discrimination: Charge Some People More', startSec: 11929 },
  { title: 'Consumer Surplus: Getting More Than You Paid For', startSec: 11999 },
  { title: 'Net Present Value: What Future Income Is Worth Today', startSec: 12047 },
  { title: 'Externalities: Calculating the Hidden Costs of Products', startSec: 12109 },
  { title: 'Bonus: Finding Time to Invest in Yourself', startSec: 12211 },
];

export interface LevelPodcastMeta {
  /** Index into PODCAST_CHAPTERS for this level's primary clip. */
  chapterIndex: number;
  /** Short pull-quote from the podcast discussion of this tweet. */
  excerpt: string;
}

/**
 * Maps each game level (1–39) to the podcast segment where Naval expands on that tweet.
 */
export const LEVEL_PODCAST: Record<number, LevelPodcastMeta> = {
  1: {
    chapterIndex: 1,
    excerpt:
      'Wealth is assets that earn while you sleep. Money is how we transfer wealth. Status is your rank in the social hierarchy — a zero-sum game.',
  },
  2: {
    chapterIndex: 2,
    excerpt:
      'True wealth creation is not about taking money. It is creating abundance. Everyone can be rich — the engine is technology applied to create more for everyone.',
  },
  3: {
    chapterIndex: 1,
    excerpt:
      'Status is a zero-sum game. To win, someone else must lose. Avoid status games — they make you angry and combative.',
  },
  4: {
    chapterIndex: 6,
    excerpt:
      'You will not get rich renting out your time. You must own equity — a piece of a business — to gain financial freedom.',
  },
  5: {
    chapterIndex: 8,
    excerpt:
      'You get rich by giving society what it wants but does not yet know how to get — at scale.',
  },
  6: {
    chapterIndex: 10,
    excerpt:
      'Pick an industry where you can play long-term games with long-term people. All returns compound when the game keeps going.',
  },
  7: {
    chapterIndex: 9,
    excerpt:
      'The internet massively broadened the possible space of careers. Most people have not figured this out yet.',
  },
  8: {
    chapterIndex: 10,
    excerpt:
      'Play iterated games. All returns in life — wealth, relationships, knowledge — come from compound interest.',
  },
  9: {
    chapterIndex: 11,
    excerpt:
      'Pick partners with intelligence, energy, and integrity. They are very rare — when you find them, hold on.',
  },
  10: {
    chapterIndex: 12,
    excerpt:
      'Do not partner with cynics and pessimists. Their beliefs are self-fulfilling and will drag you down.',
  },
  11: {
    chapterIndex: 15,
    excerpt:
      'Learn to sell. Learn to build. If you can do both, you will be unstoppable.',
  },
  12: {
    chapterIndex: 13,
    excerpt:
      'Arm yourself with specific knowledge, accountability, and leverage — the three great weapons.',
  },
  13: {
    chapterIndex: 13,
    excerpt:
      'Specific knowledge is knowledge you cannot be trained for. If society can train you, it can replace you.',
  },
  14: {
    chapterIndex: 14,
    excerpt:
      'Specific knowledge is found by pursuing genuine curiosity — not whatever is hot right now.',
  },
  15: {
    chapterIndex: 14,
    excerpt:
      'Building specific knowledge will feel like play to you but will look like work to others.',
  },
  16: {
    chapterIndex: 19,
    excerpt:
      'Embrace accountability under your own name. Society rewards you with responsibility, equity, and leverage.',
  },
  17: {
    chapterIndex: 21,
    excerpt:
      'Fortunes require leverage — from capital, people, and products with no marginal cost of replication.',
  },
  18: {
    chapterIndex: 22,
    excerpt:
      'Code and media are permissionless leverage. They work for you while you sleep — no one can stop you from creating them.',
  },
  19: {
    chapterIndex: 27,
    excerpt:
      'Set an aspirational personal hourly rate. If fixing a problem saves less than your rate, ignore it.',
  },
  20: {
    chapterIndex: 30,
    excerpt:
      'Become the best in the world at what you do. Keep redefining what you do until this is true.',
  },
  21: {
    chapterIndex: 20,
    excerpt:
      'Capital means money. To raise it, apply specific knowledge with accountability and demonstrate good judgment.',
  },
  22: {
    chapterIndex: 21,
    excerpt:
      'Labor is the oldest form of leverage — everyone fights over it. Do not waste your life chasing it.',
  },
  23: {
    chapterIndex: 21,
    excerpt:
      'Capital and labor are permissioned leverage. Someone has to give you capital; someone has to follow you.',
  },
  24: {
    chapterIndex: 22,
    excerpt:
      'Code and media are permissionless — the leverage behind the newly rich. Build assets that replicate for free.',
  },
  25: {
    chapterIndex: 22,
    excerpt:
      'An army of robots is freely available — packed in data centers. Use it.',
  },
  26: {
    chapterIndex: 22,
    excerpt:
      "If you can't code, write books and blogs, record videos and podcasts.",
  },
  27: {
    chapterIndex: 26,
    excerpt: 'Leverage is a force multiplier for your judgment.',
  },
  28: {
    chapterIndex: 26,
    excerpt:
      'Judgment requires experience, but you can build it faster by learning foundational skills.',
  },
  29: {
    chapterIndex: 18,
    excerpt:
      'There is no skill called "business." Avoid business magazines and business classes.',
  },
  30: {
    chapterIndex: 17,
    excerpt:
      'Study microeconomics, game theory, psychology, persuasion, ethics, mathematics, and computers.',
  },
  31: {
    chapterIndex: 16,
    excerpt: 'Reading is faster than listening. Doing is faster than watching.',
  },
  32: {
    chapterIndex: 29,
    excerpt:
      'Be too busy to "do coffee" while still keeping an uncluttered calendar.',
  },
  33: {
    chapterIndex: 27,
    excerpt:
      'Outsource any task that costs less than your aspirational hourly rate — your time is the constraint.',
  },
  34: {
    chapterIndex: 28,
    excerpt:
      'Work as hard as you can — but who you work with and what you work on matter more than raw effort.',
  },
  35: {
    chapterIndex: 30,
    excerpt:
      'Keep redefining what you do until you are the best in the world at it.',
  },
  36: {
    chapterIndex: 36,
    excerpt:
      'There are no get-rich-quick schemes — that is just someone else getting rich off you.',
  },
  37: {
    chapterIndex: 33,
    excerpt:
      'Apply specific knowledge with leverage and accountability — eventually you will get what you deserve.',
  },
  38: {
    chapterIndex: 37,
    excerpt:
      'Productize yourself — turn your specific knowledge into something that scales beyond your hours.',
  },
  39: {
    chapterIndex: 35,
    excerpt:
      'When you are finally wealthy, you will realize it was not what you were seeking. A calm mind, a fit body, a house full of love — these must be earned.',
  },
};

export function getPodcastSegment(levelId: number): {
  chapterTitle: string;
  startSec: number;
  endSec: number;
  excerpt: string;
  youtubeUrl: string;
  embedUrl: string;
} | null {
  const meta = LEVEL_PODCAST[levelId];
  if (!meta) return null;

  const chapter = PODCAST_CHAPTERS[meta.chapterIndex];
  const next = PODCAST_CHAPTERS[meta.chapterIndex + 1];
  const startSec = chapter.startSec;
  const endSec = next ? next.startSec - 1 : startSec + 600;

  const youtubeUrl = `https://www.youtube.com/watch?v=${PODCAST_YOUTUBE_ID}&t=${startSec}s`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${PODCAST_YOUTUBE_ID}?start=${startSec}&end=${endSec}&modestbranding=1&rel=0`;

  return {
    chapterTitle: chapter.title,
    startSec,
    endSec,
    excerpt: meta.excerpt,
    youtubeUrl,
    embedUrl,
  };
}

export function formatTimestamp(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}
