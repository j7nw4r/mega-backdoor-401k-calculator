// Shared types for the projection engine and UI.

/** All user-controllable inputs. Dollar fields are whole dollars; percent fields
 *  are human percentages (e.g. 7 means 7%, not 0.07). */
export interface CalculatorInputs {
  // Demographics / timeline
  currentAge: number;
  retirementAge: number;

  // Existing balances
  currentBalancePretax: number;
  currentBalanceRoth: number;

  // Income
  annualSalary: number;
  salaryIncreasePct: number;

  // Employee pre-tax deferral
  employeeContribPct: number;

  // Employer match (e.g. 50% match up to 6% of pay)
  employerMatchPct: number;
  employerMatchLimitPct: number;

  // Mega-backdoor: after-tax contribution target, as % of pay
  afterTaxContribPct: number;

  // Growth
  rateOfReturnPct: number;

  // Editable IRS limits (default to verified 2026 figures)
  deferralLimit: number;
  allSourcesLimit: number;
  compCap: number;
  catchUp50: number;
  catchUp6063: number;
}

/** One projected year of contributions and end-of-year balances. */
export interface YearRow {
  /** Age during this contribution year. */
  age: number;
  /** Salary for the year (before the compensation cap is applied). */
  salary: number;
  /** Salary actually usable for plan math (after 401(a)(17) cap). */
  cappedSalary: number;
  /** Employee pre-tax elective deferral (incl. any catch-up). */
  deferral: number;
  /** Employer matching contribution. */
  match: number;
  /** After-tax (mega-backdoor) contribution after clamping to available room. */
  afterTax: number;
  /** Total contributed this year from all sources. */
  totalContribution: number;
  /** Pre-tax bucket balance at end of year (deferral + match + growth). */
  pretaxBalance: number;
  /** Roth bucket balance at end of year (after-tax + growth). */
  rothBalance: number;
  /** Combined balance at end of year. */
  totalBalance: number;
}

/** Full projection result for one scenario. */
export interface ProjectionResult {
  rows: YearRow[];
  /** End-of-projection pre-tax balance. */
  finalPretax: number;
  /** End-of-projection Roth balance. */
  finalRoth: number;
  /** End-of-projection combined balance. */
  finalTotal: number;
  /** Sum of all dollars actually contributed (employee + match + after-tax). */
  totalContributed: number;
  /** finalTotal minus totalContributed minus starting balances = investment growth. */
  totalGrowth: number;
}

/** A projection plus its no-mega-backdoor counterpart, for comparison. */
export interface ComparisonResult {
  /** Scenario using the user's after-tax contribution. */
  withMega: ProjectionResult;
  /** Same inputs but afterTaxContribPct forced to 0. */
  withoutMega: ProjectionResult;
  /** Extra tax-free Roth at retirement attributable to the mega-backdoor strategy. */
  megaRothGain: number;
}
