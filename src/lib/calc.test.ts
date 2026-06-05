import { describe, expect, it } from "vitest";
import { compare, deferralInfo, project, realValue } from "./calc";
import { DEFAULT_INPUTS } from "./defaults";
import type { CalculatorInputs } from "../types";

/** Build inputs from the defaults with targeted overrides for each test. */
function inputs(overrides: Partial<CalculatorInputs>): CalculatorInputs {
  return { ...DEFAULT_INPUTS, ...overrides };
}

describe("project", () => {
  it("(a) with 0% return, end balance equals the dollars contributed", () => {
    // 1 year: deferral 10% of $100k = $10,000; match 50% of first 6% = $3,000.
    const r = project(
      inputs({
        currentAge: 40,
        retirementAge: 41,
        currentBalancePretax: 0,
        currentBalanceRoth: 0,
        annualSalary: 100_000,
        salaryIncreasePct: 0,
        employeeContribPct: 10,
        employerMatchPct: 50,
        employerMatchLimitPct: 6,
        afterTaxContribPct: 0,
        rateOfReturnPct: 0,
      }),
    );
    expect(r.rows).toHaveLength(1);
    expect(r.rows[0].deferral).toBeCloseTo(10_000, 6);
    expect(r.rows[0].match).toBeCloseTo(3_000, 6);
    expect(r.finalPretax).toBeCloseTo(13_000, 6);
    expect(r.finalRoth).toBeCloseTo(0, 6);
    expect(r.totalGrowth).toBeCloseTo(0, 6);
  });

  it("compounds a lump sum monthly with no contributions", () => {
    // $10,000 at 12%/yr compounded monthly for 1 year = 10000 * 1.01^12.
    const r = project(
      inputs({
        currentAge: 40,
        retirementAge: 41,
        currentBalancePretax: 10_000,
        currentBalanceRoth: 0,
        annualSalary: 100_000,
        salaryIncreasePct: 0,
        employeeContribPct: 0,
        employerMatchPct: 0,
        afterTaxContribPct: 0,
        rateOfReturnPct: 12,
      }),
    );
    expect(r.finalPretax).toBeCloseTo(10_000 * Math.pow(1.01, 12), 4);
    expect(r.totalContributed).toBeCloseTo(0, 6);
  });

  it("(b) age-60 super catch-up raises both the deferral cap and after-tax room", () => {
    // High contribution % so the deferral cap binds; compare ages 45 and 60.
    const capped = (age: number) =>
      project(
        inputs({
          currentAge: age,
          retirementAge: age + 1,
          annualSalary: 100_000,
          salaryIncreasePct: 0,
          employeeContribPct: 50,
          rateOfReturnPct: 0,
          afterTaxContribPct: 0,
        }),
      ).rows[0];
    expect(capped(45).deferral).toBeCloseTo(24_500, 6);
    expect(capped(60).deferral).toBeCloseTo(24_500 + 11_250, 6);

    // Moderate (uncapped) deferral so the higher 415(c)+catch-up opens more room.
    const room = (age: number) =>
      project(
        inputs({
          currentAge: age,
          retirementAge: age + 1,
          annualSalary: 100_000,
          salaryIncreasePct: 0,
          employeeContribPct: 10, // $10k deferral, well under the cap
          employerMatchPct: 50,
          employerMatchLimitPct: 6, // $3k match
          afterTaxContribPct: 100, // want everything; clamps to room
          rateOfReturnPct: 0,
        }),
      ).rows[0].afterTax;
    expect(room(45)).toBeCloseTo(72_000 - 10_000 - 3_000, 6);
    expect(room(60)).toBeCloseTo(72_000 + 11_250 - 10_000 - 3_000, 6);
    expect(room(60)).toBeGreaterThan(room(45));
  });

  it("(c) the compensation cap binds match and percent-of-pay at high salary", () => {
    const row = project(
      inputs({
        currentAge: 40,
        retirementAge: 41,
        annualSalary: 500_000, // above the $360k cap
        salaryIncreasePct: 0,
        employeeContribPct: 5,
        employerMatchPct: 50,
        employerMatchLimitPct: 6,
        afterTaxContribPct: 0,
        rateOfReturnPct: 0,
      }),
    ).rows[0];
    expect(row.cappedSalary).toBe(360_000);
    // 5% of capped salary, not of $500k (uncapped would be $25k, then 402(g)-capped).
    expect(row.deferral).toBeCloseTo(0.05 * 360_000, 6);
    // Contributing 5% (below the 6% match limit) is matched on 5%, on capped salary:
    // 50% of 5% of $360k = $9,000 (uncapped salary would give $12,500).
    expect(row.match).toBeCloseTo(0.5 * 0.05 * 360_000, 6);
  });

  it("(d) after-tax clamps to zero when deferral + match already fill 415(c)", () => {
    const row = project(
      inputs({
        currentAge: 40,
        retirementAge: 41,
        annualSalary: 100_000,
        salaryIncreasePct: 0,
        employeeContribPct: 50, // deferral capped at 24,500
        employerMatchPct: 100,
        employerMatchLimitPct: 50, // match = 100% of 50% of $100k = 50,000
        afterTaxContribPct: 20,
        rateOfReturnPct: 0,
      }),
    ).rows[0];
    // 24,500 + 50,000 already exceeds 72,000, so no after-tax room remains.
    expect(row.afterTax).toBe(0);
  });

  it("produces an empty projection when retirement age is not after current age", () => {
    const r = project(inputs({ currentAge: 65, retirementAge: 65 }));
    expect(r.rows).toHaveLength(0);
    expect(r.finalTotal).toBeCloseTo(
      DEFAULT_INPUTS.currentBalancePretax + DEFAULT_INPUTS.currentBalanceRoth,
      6,
    );
  });
});

describe("compare", () => {
  it("(e) mega-backdoor strategy adds tax-free Roth versus skipping it", () => {
    const c = compare(DEFAULT_INPUTS);
    expect(c.withMega.finalRoth).toBeGreaterThan(0);
    expect(c.withoutMega.finalRoth).toBe(0);
    expect(c.withMega.finalTotal).toBeGreaterThan(c.withoutMega.finalTotal);
    expect(c.megaRothGain).toBeGreaterThan(0);
    // The gain is exactly the with-mega Roth bucket (without-mega has none).
    expect(c.megaRothGain).toBeCloseTo(c.withMega.finalRoth, 6);
  });
});

describe("deferralInfo", () => {
  it("reports the base 402(g) limit with no catch-up under 50", () => {
    const info = deferralInfo(inputs({ currentAge: 40 }));
    expect(info.catchUp).toBe(0);
    expect(info.effectiveLimit).toBe(24_500);
  });

  it("adds the standard catch-up at 50-59 and the super catch-up at 60-63", () => {
    expect(deferralInfo(inputs({ currentAge: 55 })).effectiveLimit).toBe(
      24_500 + 8_000,
    );
    expect(deferralInfo(inputs({ currentAge: 62 })).effectiveLimit).toBe(
      24_500 + 11_250,
    );
    // Reverts to the standard catch-up at 64+.
    expect(deferralInfo(inputs({ currentAge: 65 })).effectiveLimit).toBe(
      24_500 + 8_000,
    );
  });

  it("flags when the elected percent exceeds the limit, matching the engine", () => {
    const i = inputs({
      currentAge: 40,
      annualSalary: 200_000,
      employeeContribPct: 20, // 20% of $200k = $40k, over the $24.5k limit
    });
    const info = deferralInfo(i);
    expect(info.desired).toBeCloseTo(40_000, 6);
    expect(info.isCapped).toBe(true);
    expect(info.applied).toBe(24_500);
    // The applied amount equals the engine's first-year deferral exactly.
    expect(project(i).rows[0].deferral).toBeCloseTo(info.applied, 6);
  });

  it("uses comp-capped salary for the elected amount", () => {
    const info = deferralInfo(
      inputs({ currentAge: 40, annualSalary: 500_000, employeeContribPct: 4 }),
    );
    expect(info.cappedSalary).toBe(360_000);
    expect(info.desired).toBeCloseTo(0.04 * 360_000, 6); // not 4% of $500k
    expect(info.isCapped).toBe(false);
  });
});

describe("realValue", () => {
  it("returns the nominal amount at year 0 or 0% inflation", () => {
    expect(realValue(100_000, 3, 0)).toBeCloseTo(100_000, 6);
    expect(realValue(100_000, 0, 30)).toBeCloseTo(100_000, 6);
  });

  it("discounts future dollars by compound inflation", () => {
    // $103 a year out at 3% inflation is worth ~$100 today.
    expect(realValue(103, 3, 1)).toBeCloseTo(100, 6);
    expect(realValue(1_000_000, 3, 30)).toBeCloseTo(
      1_000_000 / Math.pow(1.03, 30),
      4,
    );
  });

  it("is strictly decreasing as the horizon grows", () => {
    expect(realValue(1_000_000, 3, 30)).toBeLessThan(
      realValue(1_000_000, 3, 10),
    );
  });
});
