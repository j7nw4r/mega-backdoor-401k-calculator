import type { CalculatorInputs } from "../types";
import {
  ALL_SOURCES_LIMIT_2026,
  CATCH_UP_50_2026,
  CATCH_UP_60_63_2026,
  COMP_CAP_2026,
  DEFERRAL_LIMIT_2026,
} from "./irs";

/** Sensible starting inputs: a mid-career saver already maxing the deferral and
 *  using the mega-backdoor, so the comparison shows a meaningful Roth gain. */
export const DEFAULT_INPUTS: CalculatorInputs = {
  currentAge: 35,
  retirementAge: 65,

  currentBalancePretax: 100_000,
  currentBalanceRoth: 0,

  annualSalary: 150_000,
  salaryIncreasePct: 3,

  employeeContribPct: 17, // ~$24,500 on $150k, i.e. roughly maxes the 402(g) limit
  employerMatchPct: 50,
  employerMatchLimitPct: 6,

  afterTaxContribPct: 15,

  rateOfReturnPct: 7,
  inflationPct: 3,

  deferralLimit: DEFERRAL_LIMIT_2026,
  allSourcesLimit: ALL_SOURCES_LIMIT_2026,
  compCap: COMP_CAP_2026,
  catchUp50: CATCH_UP_50_2026,
  catchUp6063: CATCH_UP_60_63_2026,
};
