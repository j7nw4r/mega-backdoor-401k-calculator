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
      age,
      salary,
      cappedSalary,
      deferral,
      match,
      afterTax,
      totalContribution,
      pretaxBalance: pretax,
      rothBalance: roth,
      totalBalance: pretax + roth,
    });

    salary = salary * (1 + salaryIncreasePct / 100);
  }

  const finalTotal = pretax + roth;
  const startingBalance = currentBalancePretax + currentBalanceRoth;

  return {
    rows,
    finalPretax: pretax,
    finalRoth: roth,
    finalTotal,
    totalContributed,
    totalGrowth: finalTotal - totalContributed - startingBalance,
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
