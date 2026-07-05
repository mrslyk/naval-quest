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

## License

Educational tribute to Naval's tweetstorm. Not affiliated with Naval Ravikant.
