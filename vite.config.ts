import { defineConfig, loadEnv, type Plugin } from 'vite';

function navalQuestApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'naval-quest-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();

        try {
          applyEnv(env);
          const { handleApi } = await import('./api/router.js');
          const handled = await handleApi(req, res);
          if (!handled) next();
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: String(err) }));
        }
      });
    },
  };
}

function applyEnv(env: Record<string, string>) {
  const keys = [
    'SLYK_API_KEY',
    'SLYK_API_NAV',
    'SLYK_API_HOST',
    'SLYK_PAYSPACE_ORIGIN',
    'SLYK_PAYSPACE_SLUG',
    'NAVAL_LEVEL_REWARD_AMOUNT',
    'NAVAL_LEVEL_TASKS',
    'NAVAL_FUND_PRODUCT_ID',
    'NAVAL_GAME_ORIGIN',
    'NAVAL_REWARD_ASSET',
    'NAVAL_REWARD_SYMBOL',
    'RESEND_API_KEY',
    'FUND_EMAIL_FROM',
    'FUND_SUPPORT_EMAIL',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'MOONSHOT_API_KEY',
    'KIMI_API_KEY',
    'KMI_NAV_API',
    'KIMI_BASE_URL',
    'KIMI_MODEL',
  ];
  for (const key of keys) {
    if (env[key]) process.env[key] = env[key];
  }
  process.env.SLYK_API_HOST = process.env.SLYK_API_HOST || 'api.slyk.io';
  process.env.SLYK_PAYSPACE_ORIGIN = process.env.SLYK_PAYSPACE_ORIGIN || 'https://naval.slyk.io';
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    root: '.',
    publicDir: 'public',
    build: {
      outDir: 'dist',
    },
    plugins: [navalQuestApiPlugin(env)],
  };
});
