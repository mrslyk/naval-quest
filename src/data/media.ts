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

/** Where to listen to the full How to Get Rich podcast. */
export const PODCAST_PLATFORMS: MediaPlatform[] = [
  {
    id: 'youtube',
    label: 'YouTube',
    sublabel: 'Full 3h 36m video',
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
    sublabel: 'Full transcript + chapters',
    url: 'https://nav.al/rich',
    icon: '📜',
  },
];

/** Top-rated Naval videos — sorted by reach / relevance to the quest. */
export const TOP_VIDEOS: MediaVideo[] = [
  {
    id: 'rich-2024',
    title: 'How to Get Rich (2024 Edition)',
    description:
      'Best-of compilation on specific knowledge, AI, and wealth creation — a fast on-ramp before the full podcast.',
    youtubeId: 'UZXnzCRpnME',
    duration: '11 min',
    views: '120K+',
    featured: true,
    tag: 'Start here',
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
    description: 'Tim Ferriss deep dive — happiness, crypto, and the philosophy behind the tweetstorm.',
    youtubeId: 'HiYo14wylQw',
    duration: '2h 2m',
    views: '1.3M',
  },
  {
    id: 'knowledge-project',
    title: 'The Angel Philosopher',
    description:
      'Shane Parrish (Farnam Street) on reading, decisions, habits, and the purpose of life.',
    youtubeId: 'mGY2To_HW98',
    duration: '2h 2m',
    views: '707K',
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
