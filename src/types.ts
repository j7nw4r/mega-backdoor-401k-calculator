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
  /** Assumed annual inflation, used to express balances in today's dollars and
   *  to grow the retirement withdrawal each year. */
  inflationPct: number;

  // Retirement drawdown (after retirementAge)
  /** Age the drawdown runs through; the last year money may be withdrawn. */
  lifeExpectancy: number;
  /** First-year withdrawal as a percent of the balance at retirement (the "4%
   *  rule"); the dollar amount then grows with inflation each year. */
  withdrawalRate: number;
  /** Annual return during retirement, typically lower as the portfolio derisks. */
  retirementReturnPct: number;

  // Editable IRS limits (default to verified 2026 figures)
  deferralLimit: number;
  allSourcesLimit: number;
  compCap: number;
  catchUp50: number;
  catchUp6063: number;
}

/** One projected year of contributions or withdrawals and end-of-year balances. */
export interface YearRow {
  /** Whether this year is in the saving or the spending phase. */
  phase: "accumulation" | "drawdown";
  /** Age during this year. */
  age: number;
  /** Salary for the year (before the compensation cap is applied). 0 in drawdown. */
  salary: number;
  /** Salary actually usable for plan math (after 401(a)(17) cap). 0 in drawdown. */
  cappedSalary: number;
  /** Employee pre-tax elective deferral (incl. any catch-up). 0 in drawdown. */
  deferral: number;
  /** Employer matching contribution. 0 in drawdown. */
  match: number;
  /** After-tax (mega-backdoor) contribution after clamping to room. 0 in drawdown. */
  afterTax: number;
  /** Total contributed this year from all sources. 0 in drawdown. */
  totalContribution: number;
  /** Amount withdrawn this year. 0 during accumulation. */
  withdrawal: number;
  /** Pre-tax bucket balance at end of year. */
  pretaxBalance: number;
  /** Roth bucket balance at end of year. */
  rothBalance: number;
  /** Combined balance at end of year. */
  totalBalance: number;
}

/** Full projection result for one scenario. */
export interface ProjectionResult {
  /** Accumulation years followed by drawdown years, contiguous by age. */
  rows: YearRow[];
  /** Pre-tax balance at retirement (the peak, before any withdrawals). */
  finalPretax: number;
  /** Roth balance at retirement. */
  finalRoth: number;
  /** Combined balance at retirement; the headline "you'll have $X" figure. */
  finalTotal: number;
  /** Sum of all dollars actually contributed (employee + match + after-tax). */
  totalContributed: number;
  /** finalTotal minus totalContributed minus starting balances = investment growth. */
  totalGrowth: number;
  /** First-year withdrawal amount (withdrawalRate% of the balance at retirement). */
  firstYearWithdrawal: number;
  /** Sum of every dollar actually withdrawn across the drawdown phase. */
  totalWithdrawn: number;
  /** Combined balance at the end of the drawdown (age lifeExpectancy). */
  endBalance: number;
  /** Age the money runs out, or null if it lasts through life expectancy. */
  depletedAge: number | null;
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
