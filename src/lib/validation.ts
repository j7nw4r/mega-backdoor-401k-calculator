import type { CalculatorInputs } from "../types";

/** Field -> human-readable error message for the fields that fail validation. */
export type FieldErrors = Partial<Record<keyof CalculatorInputs, string>>;

interface Rule {
  min?: number;
  max?: number;
  /** Require a whole number (ages). */
  integer?: boolean;
}

// Per-field bounds. Maxima are generous; they exist to catch fat-finger typos,
// not to constrain legitimate modeling.
const RULES: Partial<Record<keyof CalculatorInputs, Rule>> = {
  currentAge: { min: 16, max: 90, integer: true },
  retirementAge: { min: 17, max: 100, integer: true },
  currentBalancePretax: { min: 0, max: 100_000_000 },
  currentBalanceRoth: { min: 0, max: 100_000_000 },
  annualSalary: { min: 0, max: 100_000_000 },
  salaryIncreasePct: { min: 0, max: 25 },
  employeeContribPct: { min: 0, max: 100 },
  employerMatchPct: { min: 0, max: 200 },
  employerMatchLimitPct: { min: 0, max: 100 },
  afterTaxContribPct: { min: 0, max: 100 },
  rateOfReturnPct: { min: 0, max: 30 },
  inflationPct: { min: 0, max: 15 },
  deferralLimit: { min: 1, max: 1_000_000 },
  allSourcesLimit: { min: 1, max: 1_000_000 },
  compCap: { min: 1, max: 100_000_000 },
  catchUp50: { min: 0, max: 1_000_000 },
  catchUp6063: { min: 0, max: 1_000_000 },
};

const fmt = (n: number) => n.toLocaleString("en-US");

function rangeError(value: number, rule: Rule): string | undefined {
  if (!Number.isFinite(value)) return "Enter a number";
  if (rule.integer && !Number.isInteger(value)) return "Must be a whole number";
  if (rule.min !== undefined && value < rule.min)
    return rule.min === 0
      ? "Cannot be negative"
      : `Must be at least ${fmt(rule.min)}`;
  if (rule.max !== undefined && value > rule.max)
    return `Must be at most ${fmt(rule.max)}`;
  return undefined;
}

/**
 * Validate every input against its bounds, plus a couple of cross-field rules.
 * Pure: returns only the fields that have a problem.
 */
export function validateInputs(inputs: CalculatorInputs): FieldErrors {
  const errors: FieldErrors = {};

  for (const key of Object.keys(RULES) as (keyof CalculatorInputs)[]) {
    const message = rangeError(inputs[key], RULES[key]!);
    if (message) errors[key] = message;
  }

  // Cross-field: retirement must come after the current age (else there is no
  // projection at all). Only add it if the field is otherwise in range.
  if (!errors.retirementAge && inputs.retirementAge <= inputs.currentAge)
    errors.retirementAge = "Must be greater than current age";

  // Cross-field: the all-sources (415(c)) limit cannot be below the elective
  // deferral (402(g)) limit, since deferrals count toward all-sources.
  if (!errors.allSourcesLimit && inputs.allSourcesLimit < inputs.deferralLimit)
    errors.allSourcesLimit = "Cannot be below the deferral limit";

  return errors;
}
