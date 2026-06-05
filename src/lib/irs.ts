// IRS limits for 401(k) plans. Defaults are the verified 2026 figures and are
// exposed as editable inputs in the UI so the tool stays useful as limits change.
//
// Sources (verified 2026-06-05):
//   - IRS Notice 2025-67 (https://www.irs.gov/pub/irs-drop/n-25-67.pdf)
//   - IRS newsroom: "401(k) limit increases to $24,500 for 2026"
//     (https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500)

export const LIMITS_YEAR = 2026;

/** 402(g) elective-deferral limit: the cap on the employee's own pre-tax/Roth deferrals. */
export const DEFERRAL_LIMIT_2026 = 24_500;

/** 415(c) annual-additions limit: caps deferrals + employer match + after-tax COMBINED.
 *  Catch-up contributions sit OUTSIDE this limit (added on top). */
export const ALL_SOURCES_LIMIT_2026 = 72_000;

/** 401(a)(17) compensation cap: the most salary that may be counted for plan purposes
 *  (both employer-match math and percent-of-pay deferrals). */
export const COMP_CAP_2026 = 360_000;

/** Age 50+ catch-up (standard). */
export const CATCH_UP_50_2026 = 8_000;

/** Ages 60-63 "super" catch-up (SECURE 2.0), used IN LIEU OF the $8,000, not in addition. */
export const CATCH_UP_60_63_2026 = 11_250;

export interface CatchUpConfig {
  /** Standard age-50+ catch-up amount. */
  catchUp50: number;
  /** Ages 60-63 super catch-up amount (replaces catchUp50 in that band). */
  catchUp6063: number;
}

/**
 * Catch-up amount available at a given age, per SECURE 2.0:
 *   - under 50: none
 *   - 50-59 and 64+: standard catch-up
 *   - 60-63: super catch-up (in lieu of the standard amount)
 */
export function catchUpForAge(age: number, cfg: CatchUpConfig): number {
  if (age < 50) return 0;
  if (age >= 60 && age <= 63) return cfg.catchUp6063;
  return cfg.catchUp50;
}
