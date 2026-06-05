# Mega-Backdoor 401(k) Calculator

A retirement calculator in the spirit of Bankrate's 401(k) calculator, but with
the one thing those tools leave out: **mega-backdoor Roth** (after-tax)
contributions. It projects your balance to retirement, tracks the pre-tax and
Roth buckets separately, and shows how much extra tax-free money the
mega-backdoor strategy adds.

Live site: _(added after first deploy)_

## What it models

- A year-by-year projection from your current age to retirement, with monthly
  contributions compounding monthly.
- Three contribution sources, each respecting the right IRS ceiling:
  - **Employee pre-tax deferral**, capped at the 402(g) limit (+ age catch-up).
  - **Employer match**, the match rate applied to the lesser of your
    contribution rate and the match-limit rate.
  - **After-tax (mega-backdoor)**, auto-capped to the 415(c) all-sources room:
    `(415(c) limit + catch-up) − deferral − match`. This is the lever ordinary
    calculators skip.
- The **401(a)(17) compensation cap** on the salary used for plan math.
- Age-based catch-up: standard at 50+, the SECURE 2.0 super catch-up at 60-63.

It runs the projection twice (with and without the after-tax contribution) to
quantify the mega-backdoor gain.

### IRS limits (2026 defaults, all editable)

| Limit                       | 2026 value                     |
| --------------------------- | ------------------------------ |
| 402(g) elective deferral    | $24,500                        |
| Age 50+ catch-up            | $8,000                         |
| Age 60-63 super catch-up    | $11,250 (in lieu of $8,000)    |
| 415(c) all-sources          | $72,000 (catch-up sits on top) |
| 401(a)(17) compensation cap | $360,000                       |

Source: IRS Notice 2025-67. Edit the values under "Advanced" to model another
year or a different plan.

## Tech stack

- React 19 + TypeScript, built with Vite
- Tailwind CSS v4
- Recharts for the growth chart
- Vitest for the projection-engine unit tests

The projection logic lives in `src/lib/calc.ts` as pure functions and is covered
by `src/lib/calc.test.ts`. IRS constants are centralized in `src/lib/irs.ts`.

## Develop

```sh
npm install
npm run dev          # local dev server
npm test             # run the unit tests
npm run typecheck    # tsc
npm run lint         # eslint
npm run format       # prettier --write
npm run build        # production build to dist/
npm run preview      # serve the production build
```

## Deploy (Cloudflare Pages)

The app is a static SPA; `npm run build` emits everything to `dist/`.

```sh
npm run build
npx wrangler pages deploy dist --project-name mega-backdoor-401k-calculator
```

The first deploy creates the Pages project. `wrangler` needs Cloudflare auth
(`npx wrangler login`, or a `CLOUDFLARE_API_TOKEN` env var with Pages access).

## Disclaimer

Educational tool only. Not tax, legal, or investment advice. Verify current IRS
limits and your plan's rules (after-tax contributions and in-plan Roth
conversion / in-service withdrawals are not offered by every plan) before
acting.
