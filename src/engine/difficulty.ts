/**
 * Progressive difficulty by level index (1–39).
 * Easy 1–13 · Medium 14–26 · Hard 27–39
 */
import type {
  TweetLevel,
  ChoiceConfig,
  SortConfig,
  TapSequenceConfig,
  MatchConfig,
  SliderConfig,
  PartnerPickConfig,
  CompoundConfig,
  CollectConfig,
  AvoidConfig,
  PathConfig,
} from '../data/tweets';

export type DifficultyBand = 'easy' | 'medium' | 'hard';

export function difficultyBand(levelId: number): DifficultyBand {
  if (levelId <= 13) return 'easy';
  if (levelId <= 26) return 'medium';
  return 'hard';
}

const EXTRA_WRONG: { label: string; sublabel: string; icon: string }[] = [
  { label: 'Chase status for leverage', sublabel: 'Zero-sum trap', icon: '🎭' },
  { label: 'Rent time forever', sublabel: 'Hourly ceiling', icon: '⏰' },
  { label: 'Copy what everyone else does', sublabel: 'Competition', icon: '🐑' },
  { label: 'Wait for permission', sublabel: 'Gatekept path', icon: '🚧' },
];

export function applyDifficulty(level: TweetLevel): TweetLevel {
  const band = difficultyBand(level.id);
  if (band === 'easy') return level;

  const config = structuredClone(level.config) as TweetLevel['config'];
  const hard = band === 'hard';

  switch (level.type) {
    case 'choice': {
      const cfg = config as ChoiceConfig;
      const extras = EXTRA_WRONG.filter(
        (e) => !cfg.options.some((o) => o.label === e.label)
      ).slice(0, hard ? 2 : 1);
      extras.forEach((e, i) => {
        cfg.options.push({
          id: `x${i}`,
          label: e.label,
          sublabel: e.sublabel,
          correct: false,
          icon: e.icon,
        });
      });
      // Shuffle so correct isn't in a fixed slot
      cfg.options = shuffle(cfg.options);
      break;
    }
    case 'slider': {
      const cfg = config as SliderConfig;
      cfg.tolerance = hard
        ? Math.max(1, Math.floor(cfg.tolerance * 0.35))
        : Math.max(2, Math.floor(cfg.tolerance * 0.6));
      break;
    }
    case 'avoid': {
      const cfg = config as AvoidConfig;
      cfg.rounds = hard ? Math.min(16, cfg.rounds + 4) : cfg.rounds + 2;
      break;
    }
    case 'compound': {
      const cfg = config as CompoundConfig;
      cfg.rounds = hard ? cfg.rounds + 3 : cfg.rounds + 1;
      break;
    }
    case 'collect': {
      const cfg = config as CollectConfig;
      const maxOk = cfg.items.filter((i) => i.permissionless).length;
      cfg.requiredCount = Math.min(maxOk, cfg.requiredCount + (hard ? 1 : 0) + (band === 'medium' ? 0 : 0));
      if (hard) cfg.requiredCount = Math.min(maxOk, Math.max(cfg.requiredCount, Math.ceil(maxOk * 0.75)));
      break;
    }
    case 'tap-sequence': {
      // Medium/hard: shuffle display order handled in renderer via data-order; keep sequence ids
      void (config as TapSequenceConfig);
      break;
    }
    case 'match': {
      void (config as MatchConfig);
      break;
    }
    case 'sort': {
      const cfg = config as SortConfig;
      // Hard: strip bucket hints
      if (hard) cfg.buckets = cfg.buckets.map((b) => ({ ...b, hint: '…' }));
      break;
    }
    case 'partner-pick': {
      const cfg = config as PartnerPickConfig;
      if (hard) {
        cfg.minStats = {
          intelligence: Math.min(10, cfg.minStats.intelligence + 1),
          energy: Math.min(10, cfg.minStats.energy + 1),
          integrity: Math.min(10, cfg.minStats.integrity + 1),
        };
      }
      break;
    }
    case 'path': {
      void (config as PathConfig);
      break;
    }
    default:
      break;
  }

  return { ...level, config };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function difficultyLabel(levelId: number): string {
  const b = difficultyBand(levelId);
  return b === 'easy' ? 'Easy' : b === 'medium' ? 'Medium' : 'Hard';
}
