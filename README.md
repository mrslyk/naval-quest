# Naval Quest

An interactive play-to-learn game based on [Naval Ravikant's "How to Get Rich" tweetstorm](https://twitter.com/naval/status/1002103360646823936).

**One challenge per tweet.** Naval guides you through each level with simple games that grow more complex over time.

## Quick start

```bash
cd naval-quest
npm install
npm run dev
```

Open http://localhost:5173

## Levels (20 tweets)

| # | Tweet theme | Game type |
|---|-------------|-----------|
| 1 | Wealth vs money vs status | Drag & sort |
| 2 | Ethical wealth creation | Multiple choice |
| 3 | Ignore status games | Tap good, avoid bad |
| 4 | Own equity, not time | Multiple choice |
| 5 | Give society what it wants | Match pairs |
| 6 | Long-term games | Multiple choice |
| 7 | Internet careers | Tap sequence |
| 8 | Compound interest | Clicker |
| 9 | Pick partners | Stat comparison |
| 10 | Avoid cynics | Tap good, avoid bad |
| 11 | Build & sell | Collect items |
| 12 | Three weapons | Tap sequence |
| 13–20 | Specific knowledge, leverage, mastery… | Mixed |

## Architecture

```
src/
  data/tweets.ts      # Tweet content + level config (add tweets here)
  engine/Game.ts      # Screen flow, progress, Naval phases
  levels/renderers.ts # Pluggable game mechanics by type
  components/ui.ts    # Naval guide, tweet card, progress bar
```

### Adding a new level

1. Add a `TweetLevel` entry to `src/data/tweets.ts`
2. Pick a `type`: `sort`, `choice`, `tap-sequence`, `match`, `slider`, `partner-pick`, `compound`, `path`, `collect`, `avoid`
3. Or add a new type in `renderers.ts` for complex mechanics later

### Future: Slyk integration

Game server can call Slyk SDK on level complete:

```js
await slyk.task.complete(TASK_ID, { userId: player.id });
```

## Build

```bash
npm run build   # → dist/
npm run preview
```

## Deploy on Netlify

1. **Import** [github.com/mrslyk/naval-quest](https://github.com/mrslyk/naval-quest) in [Netlify](https://app.netlify.com/) → Add new site → Import from Git.
2. **Build settings** (auto-detected from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
3. **Environment variables** — copy from `.env.example` into Netlify → Site settings → Environment variables:
   - `SLYK_API_KEY` (required, server-only)
   - `VITE_SLYK_DASHBOARD_URL`, `VITE_SLYK_PAYSPACE_ORIGIN`, `VITE_SLYK_API_HOST`
   - `NAVAL_GAME_ORIGIN` → your Netlify URL (e.g. `https://naval-quest.netlify.app`)
   - `SLYK_PAYSPACE_ORIGIN`, `NAVAL_REWARD_ASSET`, etc.
4. **Deploy** — Netlify runs `npm run build` and serves the SPA; `/api/*` routes hit the Netlify Function.

Custom domain: add in Netlify → Domain management, then update `NAVAL_GAME_ORIGIN` and Slyk payspace URLs if needed.

## License

Educational tribute to Naval's tweetstorm. Not affiliated with Naval Ravikant.
