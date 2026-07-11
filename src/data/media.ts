/**
 * Curated Naval Ravikant media — podcasts, top videos, books, and links.
 * Used on the landing page, How it works, and in-level media strips.
 */

export const TWEETSTORM_URL = 'https://twitter.com/naval/status/1002103360646823936';
export const ALMANACK_URL = 'https://www.navalmanack.com/';
export const NAVAL_SITE = 'https://nav.al';

export interface MediaPlatform {
  id: string;
  label: string;
  sublabel: string;
  url: string;
  icon: string;
}

export interface MediaVideo {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  views?: string;
  featured?: boolean;
  tag?: string;
}

export interface MediaBook {
  title: string;
  description: string;
  url: string;
}

/** Where to listen to Naval podcasts. */
export const PODCAST_PLATFORMS: MediaPlatform[] = [
  {
    id: 'youtube-rich',
    label: 'YouTube',
    sublabel: 'How to Get Rich — 3h 36m',
    url: 'https://www.youtube.com/watch?v=1-TZqOsVCNM',
    icon: '▶',
  },
  {
    id: 'apple',
    label: 'Apple Podcasts',
    sublabel: 'Naval podcast feed',
    url: 'https://podcasts.apple.com/us/podcast/naval/id1454097755',
    icon: '🎧',
  },
  {
    id: 'spotify',
    label: 'Spotify',
    sublabel: 'Naval podcast feed',
    url: 'https://open.spotify.com/show/7qZAVw03FuurfYnWIWwkHY',
    icon: '♫',
  },
  {
    id: 'transcript',
    label: 'nav.al/rich',
    sublabel: 'Wealth transcript + chapters',
    url: 'https://nav.al/rich',
    icon: '📜',
  },
  {
    id: 'happiness',
    label: 'nav.al/happiness',
    sublabel: 'Happiness episodes + transcript',
    url: 'https://nav.al/happiness',
    icon: '☮',
  },
];

/** Full Naval video library — sorted by YouTube reach, verified Jul 2026. */
export const TOP_VIDEOS: MediaVideo[] = [
  {
    id: 'jre-1309',
    title: 'Joe Rogan Experience #1309',
    description:
      'Naval on meditation, the tweetstorm, happiness frameworks, and Silicon Valley — his most-watched long-form interview.',
    youtubeId: '3qHkcs3kG44',
    duration: '2h 12m',
    views: '14.5M',
    tag: 'Classic',
  },
  {
    id: 'rich-full',
    title: 'How to Get Rich — Full Podcast',
    description:
      'Naval × Nivi walk through every tweet in the legendary thread. The source material for all 39 quest levels.',
    youtubeId: '1-TZqOsVCNM',
    duration: '3h 36m',
    views: '12.5M',
    tag: 'Deep dive',
  },
  {
    id: 'modern-wisdom',
    title: '44 Harsh Truths About The Game Of Life',
    description:
      'Modern Wisdom (2025) — Naval’s biggest interview in years. Status games, self-esteem, wealth, and happiness.',
    youtubeId: 'KyfUysrNaco',
    duration: '3h 16m',
    views: '5.5M',
    tag: 'New',
  },
  {
    id: 'tim-happiness',
    title: 'Naval on Happiness, Anxiety & Wealth',
    description:
      'Tim Ferriss deep dive — happiness as a skill, meditation, crypto, and the philosophy behind the tweetstorm.',
    youtubeId: 'HiYo14wylQw',
    duration: '2h 2m',
    views: '1.3M',
  },
  {
    id: 'all-in-ai',
    title: 'All-In: AI, Techno-Optimism & Tariffs',
    description:
      'Naval joins the Besties on AI policy, open source, parenting, and the future of work (All-In Summit 2024).',
    youtubeId: 'AI5qI6ej-yM',
    duration: '1h 50m',
    views: '743K',
  },
  {
    id: 'knowledge-project',
    title: 'The Angel Philosopher',
    description:
      'Shane Parrish (Farnam Street) on reading, decisions, habits, happiness, and the purpose of life.',
    youtubeId: 'mGY2To_HW98',
    duration: '2h 2m',
    views: '707K',
  },
  {
    id: 'happiness-official',
    title: 'Happiness — Official Naval Podcast',
    description:
      'Naval’s curated happiness compilation from nav.al — desire, peace, addiction, and the path to truth.',
    youtubeId: '3amLsamhtCg',
    duration: '27m',
    views: '614K',
    tag: 'Happiness',
  },
  {
    id: 'tim-2015',
    title: 'The Evolutionary Angel',
    description:
      'Tim Ferriss (2015) — the interview that launched Naval as a podcast legend. Habits, honesty, and startup wisdom.',
    youtubeId: '-7J-Gwc9pVg',
    duration: '2h 16m',
    views: '586K',
    tag: 'Classic',
  },
  {
    id: 'vitalik',
    title: 'Vitalik Buterin × Naval (Ethereum Deep Dive)',
    description:
      'Tim Ferriss hosts Vitalik with Naval co-piloting — ETH vs BTC, scaling, NFTs, and life extension.',
    youtubeId: '42uhsP4vvCE',
    duration: '2h 12m',
    views: '459K',
  },
  {
    id: 'web3',
    title: 'Chris Dixon & Naval — The Wonders of Web3',
    description:
      'Tim Ferriss with Chris Dixon and Naval on crypto, NFTs, regulation, and picking the right hill to climb.',
    youtubeId: 'DlNDYMNJ5zQ',
    duration: '2h 32m',
    views: '348K',
  },
  {
    id: 'infinity-1',
    title: 'The Beginning of Infinity, Part 1',
    description:
      'Naval × Brett Hall on David Deutsch — knowledge creation, good explanations, and infinite progress.',
    youtubeId: 'jEmJIA0pEf0',
    duration: '1h 6m',
    views: '254K',
  },
  {
    id: 'deutsch',
    title: 'David Deutsch & Naval — The Fabric of Reality',
    description:
      'Tim Ferriss with physicist David Deutsch and Naval — multiverse theory, AGI, optimism, and true knowledge.',
    youtubeId: 'FfWbcrObpUY',
    duration: '1h 48m',
    views: '195K',
  },
  {
    id: 'rich-2025-update',
    title: '“How to Get Rich” 2025 Update',
    description:
      'Modern Wisdom bonus clip — what Naval would add to the tweetstorm today. Judgment, taste, and philosophy.',
    youtubeId: '0nhkU_DImhU',
    duration: '11m',
    views: '188K',
    tag: 'Bonus',
  },
  {
    id: 'ai-industrial',
    title: 'The AI Industrial Revolution',
    description:
      'Naval podcast with Guillermo Rauch, Blake Scholl, and Max Hodak — software factories and vertical integration.',
    youtubeId: 'v6MWNrVbM4E',
    duration: '1h 10m',
    views: '165K',
    tag: '2026',
  },
  {
    id: 'tim-5-chimps',
    title: 'Happiness Hacks & the 5 Chimps Theory',
    description:
      'Tim Ferriss round two (2016) — happiness frameworks, education reform, conflict resolution, and AI.',
    youtubeId: 'I53WciFh6ik',
    duration: '1h 5m',
    views: '133K',
  },
  {
    id: 'rich-2024',
    title: 'How to Get Rich (2024 Edition)',
    description:
      'Best-of compilation on specific knowledge, AI, and wealth creation — a fast on-ramp before the full podcast.',
    youtubeId: 'UZXnzCRpnME',
    duration: '11 min',
    views: '122K',
    featured: true,
    tag: 'Start here',
  },
  {
    id: 'sovereign-child',
    title: 'How to Raise a Sovereign Child',
    description:
      'Naval × Aaron Stupple on Taking Children Seriously — freedom-maximizing parenting and non-coercion.',
    youtubeId: '2bZSzObqAjE',
    duration: '3h 3m',
    views: '118K',
  },
  {
    id: 'judgment-kapil',
    title: 'Why Good Judgment Beats Hard Work',
    description:
      'Naval × Kapil Gupta Clubhouse — leverage, desire, and why hard work gets overplayed in the age of code.',
    youtubeId: 'ckmqN05PJVA',
    duration: '16m',
    views: '101K',
  },
  {
    id: 'infinity-2',
    title: 'The Beginning of Infinity, Part 2',
    description:
      'Naval × Brett Hall continued — AGI, aliens, memetic evolution, and why groups never admit failure.',
    youtubeId: '0EPuJZWIBJk',
    duration: '53m',
    views: '76K',
  },
  {
    id: 'almanack-audio',
    title: 'Almanack 5th Anniversary — Full Audio',
    description:
      'Naval × Eric Jorgenson (2025) — 4 hours expanding wealth, happiness, and philosophy from the Almanack.',
    youtubeId: 'LAOmS1GL19I',
    duration: '3h 38m',
    views: '12K',
    tag: 'Almanack',
  },
];

export const FEATURED_VIDEO = TOP_VIDEOS.find((v) => v.featured) ?? TOP_VIDEOS[0];

export const BOOKS: MediaBook[] = [
  {
    title: 'The Almanack of Naval Ravikant',
    description: 'Eric Jorgenson’s compilation of Naval’s wisdom on wealth and happiness.',
    url: ALMANACK_URL,
  },
];

export function youtubeWatchUrl(id: string, startSec?: number): string {
  const base = `https://www.youtube.com/watch?v=${id}`;
  return startSec != null ? `${base}&t=${startSec}s` : base;
}

export function youtubeEmbedUrl(id: string, startSec?: number): string {
  const params = new URLSearchParams({ modestbranding: '1', rel: '0' });
  if (startSec != null) params.set('start', String(startSec));
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}
