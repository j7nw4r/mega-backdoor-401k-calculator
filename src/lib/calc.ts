import type {
  CalculatorInputs,
  ComparisonResult,
  ProjectionResult,
  YearRow,
} from "../types";
import { catchUpForAge } from "./irs";

/**
 * Project a 401(k) balance to retirement, tracking pre-tax and Roth
 * (mega-backdoor after-tax) buckets separately.
 *
 * Modeling assumptions (documented in the UI's Assumptions panel):
 *   - Contributions are made monthly and the balance compounds monthly at
 *     rate/12, with deposits treated as end-of-month (ordinary annuity).
 *   - Contributions run for ages [currentAge, retirementAge); the retirement
 *     year itself has no contributions, matching Bankrate's calculator.
 *   - Salary grows once per year by salaryIncreasePct.
 *   - Employer match is matchPct applied to the lesser of the elected
 *     contribution % and the match-limit %, on capped salary. (Real plans may
 *     differ via true-ups; this is the standard simplified model.)
 *
 * After retirementAge the balance enters drawdown: a first-year withdrawal of
 * withdrawalRate% of the retirement balance (the "4% rule"), grown by inflation
 * each year, pulled pro-rata from the pre-tax and Roth buckets and the
 * remainder compounded monthly at retirementReturnPct, through lifeExpectancy.
 */
export function project(inputs: CalculatorInputs): ProjectionResult {
  const {
    currentAge,
    retirementAge,
    currentBalancePretax,
    currentBalanceRoth,
    annualSalary,
    salaryIncreasePct,
    employeeContribPct,
    employerMatchPct,
    employerMatchLimitPct,
    afterTaxContribPct,
    rateOfReturnPct,
    inflationPct,
    lifeExpectancy,
    withdrawalRate,
    retirementReturnPct,
    deferralLimit,
    allSourcesLimit,
    compCap,
    catchUp50,
    catchUp6063,
  } = inputs;

  const rows: YearRow[] = [];
  const monthlyRate = rateOfReturnPct / 100 / 12;

  let pretax = currentBalancePretax;
  let roth = currentBalanceRoth;
  let salary = annualSalary;
  let totalContributed = 0;

  const years = Math.max(0, Math.floor(retirementAge - currentAge));

  for (let i = 0; i < years; i++) {
    const age = currentAge + i;

    // 401(a)(17): only this much salary counts for plan math.
    const cappedSalary = Math.min(salary, compCap);
    const catchUp = catchUpForAge(age, { catchUp50, catchUp6063 });

    // Employee pre-tax deferral, capped at 402(g) limit + age-based catch-up.
    const desiredDeferral = (employeeContribPct / 100) * cappedSalary;
    const deferral = Math.min(desiredDeferral, deferralLimit + catchUp);

    // Employer match: matchPct of the first matchLimitPct of pay.
    const matchedFraction =
      Math.min(employeeContribPct, employerMatchLimitPct) / 100;
    const match = (employerMatchPct / 100) * matchedFraction * cappedSalary;

    // Mega-backdoor after-tax room: 415(c) (+catch-up) minus what already counts.
    const afterTaxRoom = Math.max(
      0,
      allSourcesLimit + catchUp - deferral - match,
    );
    const desiredAfterTax = (afterTaxContribPct / 100) * cappedSalary;
    const afterTax = Math.min(desiredAfterTax, afterTaxRoom);

    const totalContribution = deferral + match + afterTax;
    totalContributed += totalContribution;

    // Grow each bucket month by month; deposits land at month end.
    const monthlyPretax = (deferral + match) / 12;
    const monthlyRoth = afterTax / 12;
    for (let m = 0; m < 12; m++) {
      pretax = pretax * (1 + monthlyRate) + monthlyPretax;
      roth = roth * (1 + monthlyRate) + monthlyRoth;
    }

    rows.push({
      phase: "accumulation",
      age,
      salary,
      cappedSalary,
      deferral,
      match,
      afterTax,
      totalContribution,
      withdrawal: 0,
      pretaxBalance: pretax,
      rothBalance: roth,
      totalBalance: pretax + roth,
    });

    salary = salary * (1 + salaryIncreasePct / 100);
  }

  // Snapshot the balance at retirement: this is the headline figure and the
  // base for the withdrawal, so it must be captured before the drawdown loop
  // starts spending it down.
  const finalPretax = pretax;
  const finalRoth = roth;
  const finalTotal = pretax + roth;
  const startingBalance = currentBalancePretax + currentBalanceRoth;

  // Drawdown: ages [retirementAge, lifeExpectancy]. The first year's withdrawal
  // is withdrawalRate% of the retirement balance; each later year scales that
  // dollar figure by inflation so spending power stays constant in real terms.
  const firstYearWithdrawal = (withdrawalRate / 100) * finalTotal;
  const retireMonthlyRate = retirementReturnPct / 100 / 12;
  // Draw down through life expectancy inclusive (you spend during your final
  // year), so ages run [retirementAge, lifeExpectancy]. Only runs when there is
  // a real accumulation phase; otherwise the projection is empty and the UI
  // shows its prompt-for-input state, matching validation.
  const drawdownYears =
    years > 0 && lifeExpectancy > retirementAge
      ? Math.floor(lifeExpectancy - retirementAge) + 1
      : 0;
  let totalWithdrawn = 0;
  let depletedAge: number | null = null;

  for (let i = 0; i < drawdownYears; i++) {
    const age = retirementAge + i;
    const yearWithdrawal =
      firstYearWithdrawal * Math.pow(1 + inflationPct / 100, i);
    const monthlyWithdrawal = yearWithdrawal / 12;
    let withdrawnThisYear = 0;

    for (let m = 0; m < 12; m++) {
      // Grow first, then take the month's spending from whatever is left.
      pretax = pretax * (1 + retireMonthlyRate);
      roth = roth * (1 + retireMonthlyRate);
      const total = pretax + roth;
      const take = Math.min(monthlyWithdrawal, total);
      if (total > 0) {
        // Pull from each bucket in proportion to its current size.
        pretax -= take * (pretax / total);
        roth -= take * (roth / total);
      }
      withdrawnThisYear += take;
    }

    totalWithdrawn += withdrawnThisYear;
    // The money is exhausted the first year its end balance hits zero. Once at
    // zero it stays there (each withdrawal just takes whatever growth produced).
    if (depletedAge === null && pretax + roth <= 1e-6) depletedAge = age;

    rows.push({
      phase: "drawdown",
      age,
      salary: 0,
      cappedSalary: 0,
      deferral: 0,
      match: 0,
      afterTax: 0,
      totalContribution: 0,
      withdrawal: withdrawnThisYear,
      pretaxBalance: pretax,
      rothBalance: roth,
      totalBalance: pretax + roth,
    });
  }

  return {
    rows,
    finalPretax,
    finalRoth,
    finalTotal,
    totalContributed,
    totalGrowth: finalTotal - totalContributed - startingBalance,
    firstYearWithdrawal,
    totalWithdrawn,
    endBalance: pretax + roth,
    depletedAge,
  };
}

/**
 * Run the projection both with the user's after-tax contribution and with it
 * zeroed out, to quantify what the mega-backdoor strategy adds.
 */
export function compare(inputs: CalculatorInputs): ComparisonResult {
  const withMega = project(inputs);
  const withoutMega = project({ ...inputs, afterTaxContribPct: 0 });
  return {
    withMega,
    withoutMega,
    megaRothGain: withMega.finalRoth - withoutMega.finalRoth,
  };
}

/** Discount a future nominal dollar amount to today's purchasing power:
 *  real = nominal / (1 + inflation)^years. The inverse of growth compounding. */
export function realValue(
  nominal: number,
  inflationPct: number,
  years: number,
): number {
  return nominal / Math.pow(1 + inflationPct / 100, Math.max(0, years));
}

/** The pre-tax deferral limit being applied, and how the elected contribution
 *  sits against it, evaluated for the current age and this year's salary. This
 *  is the same rule project() uses for the first year, surfaced for the UI. */
export interface DeferralInfo {
  /** 402(g) base limit only (the editable value). */
  baseLimit: number;
  /** Age-based catch-up included this year (0 under 50). */
  catchUp: number;
  /** baseLimit + catchUp: the actual ceiling applied. */
  effectiveLimit: number;
  /** This year's salary after the 401(a)(17) compensation cap. */
  cappedSalary: number;
  /** Elected percent of capped salary, before the limit is applied. */
  desired: number;
  /** What actually gets deferred: min(desired, effectiveLimit). */
  applied: number;
  /** True when the elected percent would exceed the limit. */
  isCapped: boolean;
}

export function deferralInfo(inputs: CalculatorInputs): DeferralInfo {
  const cappedSalary = Math.min(inputs.annualSalary, inputs.compCap);
  const catchUp = catchUpForAge(inputs.currentAge, {
    catchUp50: inputs.catchUp50,
    catchUp6063: inputs.catchUp6063,
  });
  const effectiveLimit = inputs.deferralLimit + catchUp;
  const desired = (inputs.employeeContribPct / 100) * cappedSalary;
  return {
    baseLimit: inputs.deferralLimit,
    catchUp,
    effectiveLimit,
    cappedSalary,
    desired,
    applied: Math.min(desired, effectiveLimit),
    isCapped: desired > effectiveLimit,
  };
}
