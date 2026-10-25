# Calorie Tracker

A simple, phone-first calorie tracker for two people. Each person taps their name and enters a 4-digit PIN.

- Log a meal description and its calories, or look up a food on [Open Food Facts](https://world.openfoodfacts.org) and enter the grams.
- Dashboard: today's total against your goal, calories left, a 7-day chart and your logging streak.
- Optional shared panel showing both people's totals for today (totals only, never the food list).

Built with Next.js, Tailwind CSS and Postgres (Neon on Vercel).

## Deploy on Vercel

1. Sign in at [vercel.com](https://vercel.com) with GitHub, click **Add New → Project** and import this repo. Leave the defaults.
2. Before (or after) the first deploy, open the project's **Storage** tab, add **Neon** (free) and connect it to the project. This sets `DATABASE_URL` for you.
3. In **Settings → Environment Variables**, add `SESSION_SECRET`: any random string of 32 or more characters. Optionally add `APP_TIMEZONE` (default `Africa/Johannesburg`).
4. Redeploy (**Deployments → ⋯ → Redeploy**) so the new variables are picked up.
5. Open the site and tap **Set up the two users**. Each person adds their name and PIN. Setup closes once two users exist.

Tables are created automatically on first use, so there is no database step.

## Day-to-day

- **Forgot a PIN?** Open the Neon console (Vercel → Storage → Neon → Open in Neon), go to the SQL editor and run `DELETE FROM users WHERE name = 'Their Name';`. This deletes their entries too. Then use **Set up** on the login screen again. To keep entries, change the PIN in the app instead (**Me → Change PIN**).
- **Locked out?** Five wrong PINs lock that person out for 15 minutes.

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in SESSION_SECRET
npm run db:local             # local Postgres stand-in on port 5433 (keep running)
npm run dev
```

With the local database, set `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/postgres?sslmode=disable` in `.env.local`.
