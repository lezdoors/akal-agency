// Environment variables for Vercel deployment.
// Set these in your Vercel project dashboard (Settings → Environment Variables).

type AppEnv = {
  HF_ENV?: string;
  APP_SLUG?: string;
};

export function env(): AppEnv {
  return {
    HF_ENV: process.env.HF_ENV ?? "production",
    APP_SLUG: process.env.APP_SLUG ?? "akal-agency",
  };
}