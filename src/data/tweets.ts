export type LevelType =
  | 'sort'
  | 'choice'
  | 'tap-sequence'
  | 'match'
  | 'slider'
  | 'partner-pick'
  | 'compound'
  | 'path'
  | 'collect'
  | 'avoid';

export interface TweetLevel {
  id: number;
  tweet: string;
  riddle?: string;
  navalIntro: string;
  navalSuccess: string;
  navalHint: string;
  title: string;
  type: LevelType;
  config: LevelConfig;
}

export type LevelConfig =
  | SortConfig
  | ChoiceConfig
  | TapSequenceConfig
  | MatchConfig
  | SliderConfig
  | PartnerPickConfig
  | CompoundConfig
  | PathConfig
  | CollectConfig
  | AvoidConfig;

export interface SortConfig {
  buckets: { id: string; label: string; hint: string }[];
  items: { id: string; label: string; bucket: string; icon: string }[];
}

export interface ChoiceConfig {
  prompt: string;
  options: { id: string; label: string; sublabel?: string; correct: boolean; icon: string }[];
}

export interface TapSequenceConfig {
  prompt: string;
  sequence: { id: string; label: string; icon: string }[];
}

export interface MatchConfig {
  left: { id: string; label: string }[];
  right: { id: string; label: string; matchId: string }[];
}

export interface SliderConfig {
  prompt: string;
  min: number;
  max: number;
  target: number;
  tolerance: number;
  unit: string;
  labels: { value: number; label: string }[];
}

export interface PartnerPickConfig {
  candidates: {
    id: string;
    name: string;
    intelligence: number;
    energy: number;
    integrity: number;
    isCynic?: boolean;
  }[];
  minStats: { intelligence: number; energy: number; integrity: number };
}

export interface CompoundConfig {
  prompt: string;
  rounds: number;
  baseRate: number;
}

export interface PathConfig {
  nodes: { id: string; label: string; x: number; y: number; correct?: boolean }[];
  connections: { from: string; to: string; correct?: boolean }[];
}

export interface CollectConfig {
  prompt: string;
  items: { id: string; label: string; icon: string; permissionless: boolean }[];
  requiredCount: number;
}

export interface AvoidConfig {
  prompt: string;
  good: { id: string; label: string; icon: string }[];
  bad: { id: string; label: string; icon: string }[];
  rounds: number;
}

export const TWEET_LEVELS: TweetLevel[] = [
  {
    id: 1,
    tweet:
      'Seek wealth, not money or status. Wealth is having assets that earn while you sleep. Money is how we transfer time and wealth. Status is your place in the social hierarchy.',
    riddle: 'Three jars labeled with the tweet\'s own words. Place each symbol where it belongs.',
    navalIntro:
      "Welcome. Most people chase the wrong thing their whole life. Let's start by learning to tell wealth, money, and status apart.",
    navalSuccess: 'Perfect. You see the difference. Wealth compounds. Status is a zero-sum game.',
    navalHint: 'Drag each item into the bucket Naval would choose.',
    title: 'Wealth · Money · Status',
    type: 'sort',
    config: {
      buckets: [
        { id: 'wealth', label: 'Wealth', hint: 'Earns while you sleep' },
        { id: 'money', label: 'Money', hint: 'Transfers value' },
        { id: 'status', label: 'Status', hint: 'Social hierarchy' },
      ],
      items: [
        { id: '1', label: 'Rental property', bucket: 'wealth', icon: '🏠' },
        { id: '2', label: 'Paycheck', bucket: 'money', icon: '💵' },
        { id: '3', label: 'Twitter followers', bucket: 'status', icon: '📱' },
        { id: '4', label: 'SaaS subscription', bucket: 'wealth', icon: '⚡' },
        { id: '5', label: 'Cash in wallet', bucket: 'money', icon: '👛' },
        { id: '6', label: 'Board seat title', bucket: 'status', icon: '🎖️' },
      ],
    },
  },
  {
    id: 2,
    tweet:
      'Understand that ethical wealth creation is possible. If you secretly despise wealth, it will elude you.',
    navalIntro:
      'Before we go further — do you actually believe wealth can be created ethically? Your subconscious will sabotage you if you don\'t.',
    navalSuccess: 'Good. Wealth is not a fixed pie. You create it by making society better off.',
    navalHint: 'Choose the mindset that unlocks wealth creation.',
    title: 'Ethical Wealth',
    type: 'choice',
    config: {
      prompt: 'Which belief will help you build wealth?',
      options: [
        {
          id: 'a',
          label: 'Wealth is stolen from others',
          sublabel: 'Zero-sum thinking',
          correct: false,
          icon: '🚫',
        },
        {
          id: 'b',
          label: 'Ethical wealth creation is possible',
          sublabel: 'Create value, capture a fraction',
          correct: true,
          icon: '✨',
        },
        {
          id: 'c',
          label: 'Rich people are all corrupt',
          sublabel: 'Moral superiority',
          correct: false,
          icon: '😤',
        },
      ],
    },
  },
  {
    id: 3,
    tweet:
      'Ignore people playing status games. They gain status by attacking people playing wealth creation games.',
    navalIntro:
      'Status players attack builders. Your job is to recognize the game and refuse to play.',
    navalSuccess: 'You ignored the noise. Status games are distraction. Stay on wealth creation.',
    navalHint: 'Tap only the wealth builders. Avoid the status attackers.',
    title: 'Ignore Status Games',
    type: 'avoid',
    config: {
      prompt: 'Tap the builders. Avoid the attackers.',
      good: [
        { id: 'g1', label: 'Ship product', icon: '🚀' },
        { id: 'g2', label: 'Write code', icon: '💻' },
        { id: 'g3', label: 'Build audience', icon: '📈' },
      ],
      bad: [
        { id: 'b1', label: 'Cancel someone', icon: '🔥' },
        { id: 'b2', label: 'Virtue signal', icon: '📢' },
        { id: 'b3', label: 'Outrage post', icon: '😡' },
      ],
      rounds: 8,
    },
  },
  {
    id: 4,
    tweet:
      "You're not going to get rich renting out your time. You must own equity — a piece of a business — to gain your financial freedom.",
    navalIntro:
      'Hourly work has a ceiling — there are only 24 hours. Equity has no ceiling. Choose ownership.',
    navalSuccess: 'Exactly. Equity is how you escape the time trap.',
    navalHint: 'Pick paths that build ownership, not hourly rental.',
    title: 'Own Equity',
    type: 'choice',
    config: {
      prompt: 'Which path builds real wealth?',
      options: [
        {
          id: 'a',
          label: '$500/hr consulting',
          sublabel: 'Rents your time',
          correct: false,
          icon: '⏰',
        },
        {
          id: 'b',
          label: '5% of a growing startup',
          sublabel: 'Owns equity',
          correct: true,
          icon: '📊',
        },
        {
          id: 'c',
          label: 'Overtime at your job',
          sublabel: 'More hours, same ceiling',
          correct: false,
          icon: '🌙',
        },
      ],
    },
  },
  {
    id: 5,
    tweet:
      'You will get rich by giving society what it wants but does not yet know how to get. At scale.',
    navalIntro:
      'Wealth is society paying you for things it wants but doesn\'t know how to get. Match demand to supply.',
    navalSuccess: 'You found product-market fit. Scale is everything.',
    navalHint: 'Match each desire to the invention that fulfills it.',
    title: 'Society Wants This',
    type: 'match',
    config: {
      left: [
        { id: 'l1', label: 'Instant global communication' },
        { id: 'l2', label: 'Search all human knowledge' },
        { id: 'l3', label: 'Shop from your couch' },
      ],
      right: [
        { id: 'r1', label: 'Smartphone + messaging', matchId: 'l1' },
        { id: 'r2', label: 'Search engine', matchId: 'l2' },
        { id: 'r3', label: 'E-commerce platform', matchId: 'l3' },
      ],
    },
  },
  {
    id: 6,
    tweet:
      'Pick an industry where you can play long-term games with long-term people.',
    navalIntro:
      'Short-term industries attract short-term people. Pick where you can compound relationships for decades.',
    navalSuccess: 'Long-term games with long-term people. That\'s the foundation.',
    navalHint: 'Choose industries built for decades, not hype cycles.',
    title: 'Long-Term Games',
    type: 'choice',
    config: {
      prompt: 'Where would Naval play a 20-year game?',
      options: [
        {
          id: 'a',
          label: 'Meme coin of the week',
          sublabel: '12-month hype cycle',
          correct: false,
          icon: '🎰',
        },
        {
          id: 'b',
          label: 'Software infrastructure',
          sublabel: 'Decades of compounding',
          correct: true,
          icon: '🏗️',
        },
        {
          id: 'c',
          label: 'Trending TikTok niche',
          sublabel: 'Gone in 6 months',
          correct: false,
          icon: '📉',
        },
      ],
    },
  },
  {
    id: 7,
    tweet:
      "The Internet has massively broadened the possible space of careers. Most people haven't figured this out yet.",
    navalIntro:
      'The internet let you reach 8 billion people from your laptop. Tap the careers the old world couldn\'t offer.',
    navalSuccess: 'The internet is the great career expander. Most people still don\'t see it.',
    navalHint: 'Tap all the internet-native careers in order.',
    title: 'Internet Careers',
    type: 'tap-sequence',
    config: {
      prompt: 'Tap each internet-native career:',
      sequence: [
        { id: 's1', label: 'Indie creator', icon: '🎬' },
        { id: 's2', label: 'Remote founder', icon: '🌍' },
        { id: 's3', label: 'Open-source dev', icon: '🔓' },
        { id: 's4', label: 'Newsletter writer', icon: '✉️' },
      ],
    },
  },
  {
    id: 8,
    tweet:
      'Play iterated games. All the returns in life, whether in wealth, relationships, or knowledge, come from compound interest.',
    navalIntro:
      'One push-up doesn\'t make you fit. One tweet doesn\'t make you rich. Compound interest is the secret. Let\'s watch it grow.',
    navalSuccess: 'Compound interest — the eighth wonder. Iteration beats intensity.',
    navalHint: 'Click to invest. Watch your returns compound over rounds.',
    title: 'Compound Interest',
    type: 'compound',
    config: {
      prompt: 'Invest each round. Watch compounding work.',
      rounds: 6,
      baseRate: 1.15,
    },
  },
  {
    id: 9,
    tweet:
      'Pick business partners with high intelligence, energy, and integrity. They are very rare.',
    navalIntro:
      'A great partner multiplies you. A bad one divides you. Evaluate on three axes: intelligence, energy, integrity.',
    navalSuccess: 'You picked a rare one. All three axes matter equally.',
    navalHint: 'Choose the partner with high intelligence, energy, AND integrity.',
    title: 'Pick Partners',
    type: 'partner-pick',
    config: {
      candidates: [
        {
          id: 'p1',
          name: 'Alex',
          intelligence: 9,
          energy: 8,
          integrity: 9,
        },
        {
          id: 'p2',
          name: 'Jordan',
          intelligence: 10,
          energy: 10,
          integrity: 3,
        },
        {
          id: 'p3',
          name: 'Sam',
          intelligence: 6,
          energy: 6,
          integrity: 6,
        },
      ],
      minStats: { intelligence: 8, energy: 7, integrity: 8 },
    },
  },
  {
    id: 10,
    tweet:
      "Don't partner with cynics and pessimists. Their beliefs are self-fulfilling.",
    navalIntro:
      'Pessimists are contagious. Their beliefs become self-fulfilling prophecies. Avoid them.',
    navalSuccess: 'You dodged the cynics. Optimism with clear eyes wins.',
    navalHint: 'Tap the optimists. Avoid the cynics.',
    title: 'Avoid Cynics',
    type: 'avoid',
    config: {
      prompt: 'Tap the builders. Avoid the cynics.',
      good: [
        { id: 'g1', label: '"We can figure it out"', icon: '💡' },
        { id: 'g2', label: '"Let\'s try it"', icon: '🧪' },
        { id: 'g3', label: '"It\'s possible"', icon: '🌅' },
      ],
      bad: [
        { id: 'b1', label: '"That\'ll never work"', icon: '🙄' },
        { id: 'b2', label: '"We tried that before"', icon: '😒' },
        { id: 'b3', label: '"The market is dead"', icon: '💀' },
      ],
      rounds: 8,
    },
  },
  {
    id: 11,
    tweet:
      'Learn to sell. Learn to build. If you can do both, you will be unstoppable.',
    navalIntro:
      'The two core skills: build and sell. Most people do one. The legends do both.',
    navalSuccess: 'Build AND sell. You\'re unstoppable.',
    navalHint: 'Collect both skills to proceed.',
    title: 'Build & Sell',
    type: 'collect',
    config: {
      prompt: 'Collect both core skills:',
      items: [
        { id: 'build', label: 'Build', icon: '🔨', permissionless: true },
        { id: 'sell', label: 'Sell', icon: '🎯', permissionless: true },
        { id: 'mba', label: 'MBA pedigree', icon: '🎓', permissionless: false },
        { id: 'certs', label: 'Certificates', icon: '📜', permissionless: false },
      ],
      requiredCount: 2,
    },
  },
  {
    id: 12,
    tweet:
      'Arm yourself with specific knowledge, accountability, and leverage.',
    navalIntro:
      'Three weapons: specific knowledge (what only you know), accountability (skin in the game), leverage (force multiplier).',
    navalSuccess: 'Armed with all three. Now you can actually create wealth.',
    navalHint: 'Tap all three weapons of wealth creation.',
    title: 'Three Weapons',
    type: 'tap-sequence',
    config: {
      prompt: 'Arm yourself — tap each weapon:',
      sequence: [
        { id: 's1', label: 'Specific knowledge', icon: '🧠' },
        { id: 's2', label: 'Accountability', icon: '⚖️' },
        { id: 's3', label: 'Leverage', icon: '🔧' },
      ],
    },
  },
  {
    id: 13,
    tweet:
      'Specific knowledge is knowledge that you cannot be trained for. If society can train you, it can train someone else, and replace you.',
    navalIntro:
      'If a bootcamp can teach it, you\'re replaceable. Find knowledge only you can have.',
    navalSuccess: 'Irreplaceable knowledge. Society can\'t train a clone of you.',
    navalHint: 'Pick the knowledge that can\'t be mass-produced.',
    title: 'Specific Knowledge',
    type: 'choice',
    config: {
      prompt: 'Which is true specific knowledge?',
      options: [
        {
          id: 'a',
          label: 'Generic Excel skills',
          sublabel: 'Anyone can learn this',
          correct: false,
          icon: '📊',
        },
        {
          id: 'b',
          label: 'Your obsession since age 12',
          sublabel: 'Cannot be trained for',
          correct: true,
          icon: '🔮',
        },
        {
          id: 'c',
          label: 'Corporate compliance training',
          sublabel: 'Mass-produced',
          correct: false,
          icon: '📋',
        },
      ],
    },
  },
  {
    id: 14,
    tweet:
      'Specific knowledge is found by pursuing your genuine curiosity and passion rather than whatever is hot right now.',
    navalIntro:
      'Follow genuine curiosity, not trends. What fascinates you at 2am? That\'s your specific knowledge.',
    navalSuccess: 'Curiosity beats trends. The hot thing is already crowded.',
    navalHint: 'Choose curiosity over hype.',
    title: 'Follow Curiosity',
    type: 'choice',
    config: {
      prompt: 'Where does specific knowledge come from?',
      options: [
        {
          id: 'a',
          label: 'Whatever is trending on HN',
          sublabel: 'Crowded, late',
          correct: false,
          icon: '🔥',
        },
        {
          id: 'b',
          label: 'Genuine curiosity since childhood',
          sublabel: 'Unique to you',
          correct: true,
          icon: '🌟',
        },
        {
          id: 'c',
          label: 'Whatever VCs are funding',
          sublabel: 'Someone else\'s thesis',
          correct: false,
          icon: '💰',
        },
      ],
    },
  },
  {
    id: 15,
    tweet:
      'Building specific knowledge will feel like play to you but will look like work to others.',
    navalIntro:
      'When it feels like play to you but looks like work to others — that\'s the signal. Find that intersection.',
    navalSuccess: 'Play for you, work for them. That\'s the sweet spot.',
    navalHint: 'Set the slider to where it feels like play to you.',
    title: 'Play vs Work',
    type: 'slider',
    config: {
      prompt: 'How does building your specific knowledge feel to YOU?',
      min: 0,
      max: 100,
      target: 90,
      tolerance: 15,
      unit: '%',
      labels: [
        { value: 0, label: 'Grinding' },
        { value: 50, label: 'Mixed' },
        { value: 100, label: 'Pure play' },
      ],
    },
  },
  {
    id: 16,
    tweet:
      'Embrace accountability, and take business risks under your own name. Society will reward you with responsibility, equity, and leverage.',
    navalIntro:
      'Put your name on it. Anonymous risk-takers don\'t get rewarded. Society rewards accountable people.',
    navalSuccess: 'Accountability under your own name. Society will reward you.',
    navalHint: 'Choose the path with real accountability.',
    title: 'Accountability',
    type: 'choice',
    config: {
      prompt: 'Which approach earns trust and equity?',
      options: [
        {
          id: 'a',
          label: 'Anonymous Twitter account',
          sublabel: 'No skin in the game',
          correct: false,
          icon: '🎭',
        },
        {
          id: 'b',
          label: 'Build under your real name',
          sublabel: 'Accountability + reputation',
          correct: true,
          icon: '🪪',
        },
        {
          id: 'c',
          label: 'Blame the team when it fails',
          sublabel: 'No accountability',
          correct: false,
          icon: '👆',
        },
      ],
    },
  },
  {
    id: 17,
    tweet:
      'Fortunes require leverage. Business leverage from capital, people, and products with no marginal cost of replication (code and media).',
    navalIntro:
      'Four types of leverage: capital, labor, code, media. The last two are permissionless. Collect them.',
    navalSuccess: 'Leverage acquired. Code and media work while you sleep.',
    navalHint: 'Collect the permissionless forms of leverage.',
    title: 'Four Levers',
    type: 'collect',
    config: {
      prompt: 'Collect permissionless leverage (code + media):',
      items: [
        { id: 'code', label: 'Code', icon: '💻', permissionless: true },
        { id: 'media', label: 'Media', icon: '🎙️', permissionless: true },
        { id: 'capital', label: 'Capital', icon: '🏦', permissionless: false },
        { id: 'labor', label: 'Labor', icon: '👥', permissionless: false },
      ],
      requiredCount: 2,
    },
  },
  {
    id: 18,
    tweet:
      "Code and media are permissionless leverage. They're the leverage behind the newly rich. You can create software and media that works for you while you sleep.",
    navalIntro:
      'No one can stop you from writing code or recording a podcast. Permissionless leverage — tap to deploy.',
    navalSuccess: 'Deployed while you sleep. Permissionless leverage is the great equalizer.',
    navalHint: 'Tap to deploy each asset that works 24/7.',
    title: 'Permissionless Leverage',
    type: 'tap-sequence',
    config: {
      prompt: 'Deploy assets that work while you sleep:',
      sequence: [
        { id: 's1', label: 'Ship an app', icon: '📱' },
        { id: 's2', label: 'Publish a book', icon: '📚' },
        { id: 's3', label: 'Record a course', icon: '🎥' },
      ],
    },
  },
  {
    id: 19,
    tweet:
      'Set and enforce an aspirational personal hourly rate. If fixing a problem will save less than your hourly rate, ignore it.',
    navalIntro:
      'Set an aspirational hourly rate — higher than your current one. Outsource anything below it.',
    navalSuccess: 'Your time has a price. Enforce it ruthlessly.',
    navalHint: 'Set your aspirational hourly rate above $500/hr.',
    title: 'Hourly Rate',
    type: 'slider',
    config: {
      prompt: 'Set your aspirational hourly rate:',
      min: 50,
      max: 1000,
      target: 500,
      tolerance: 100,
      unit: '/hr',
      labels: [
        { value: 50, label: '$50' },
        { value: 500, label: '$500' },
        { value: 1000, label: '$1,000' },
      ],
    },
  },
  {
    id: 20,
    tweet:
      'Become the best in the world at what you do. Keep redefining what you do until this is true.',
    navalIntro:
      'Keep narrowing until you\'re the best in the world. Then keep redefining. The path never ends.',
    navalSuccess: 'You chose mastery. Keep redefining until you\'re the best.',
    navalHint: 'Pick the mastery path.',
    title: 'Best in the World',
    type: 'path',
    config: {
      nodes: [
        { id: 'n1', label: 'Generalist', x: 10, y: 50 },
        { id: 'n2', label: 'Specialist', x: 35, y: 30, correct: true },
        { id: 'n3', label: 'Niche master', x: 60, y: 20, correct: true },
        { id: 'n4', label: 'Best in world', x: 85, y: 10, correct: true },
        { id: 'n5', label: 'Jack of all trades', x: 35, y: 70 },
      ],
      connections: [
        { from: 'n1', to: 'n2', correct: true },
        { from: 'n2', to: 'n3', correct: true },
        { from: 'n3', to: 'n4', correct: true },
        { from: 'n1', to: 'n5' },
      ],
    },
  },
];

import { TWEET_LEVELS_EXTRA } from './tweets-extra';

export const TWEET_LEVELS_ALL: TweetLevel[] = [...TWEET_LEVELS, ...TWEET_LEVELS_EXTRA];

export const TOTAL_LEVELS = TWEET_LEVELS_ALL.length;
