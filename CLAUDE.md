# CLAUDE.md: Mega-Backdoor 401(k) Calculator

A client-side React + Vite + Tailwind SPA that projects a 401(k) to retirement,
including mega-backdoor Roth (after-tax) contributions, then draws the balance
down through life expectancy. No backend.

## Where things live

- `src/lib/calc.ts` — the projection engine. Pure functions, no React. This is
  the heart of the app; change behavior here, not in components.
- `src/lib/calc.test.ts` — Vitest unit tests with hand-computed expectations.
  Update these whenever you touch `calc.ts`.
- `src/lib/irs.ts` — single source of truth for IRS limits and the age-based
  catch-up logic. Update yearly.
- `src/lib/defaults.ts` — initial input values.
- `src/lib/validation.ts` — pure `validateInputs(inputs)` returning per-field
  error messages (range + cross-field rules). Add new field bounds here.
- `src/components/*` — presentational; the engine output flows in via props.

## Conventions

- UUIDv7 preference and other global rules from `~/.claude/CLAUDE.md` apply.
- No em/en dashes or emojis anywhere (including UI copy and labels).
- Keep `calc.ts` framework-free and tested. Any new IRS rule goes through
  `irs.ts` so the UI and engine stay consistent.

## Validate before declaring done

```sh
npm run typecheck && npm run lint && npm run format:check && npm test && npm run build
```

## Keep in sync in the same change

- `README.md` — features, IRS limit table, deploy steps.
- `src/lib/irs.ts` — when limits change, update constants AND the README table.
- `~/.claude/docs/infrastructure/mega-backdoor-401k-calculator.md` — repo URL,
  Cloudflare Pages project, redeploy command.

## Deploy

Static build to `dist/`, hosted on Cloudflare Pages:

```sh
npm run build
npx wrangler pages deploy dist --project-name mega-backdoor-401k-calculator
```
