import { describe, expect, it } from "vitest";
import { validateInputs } from "./validation";
import { DEFAULT_INPUTS } from "./defaults";
import type { CalculatorInputs } from "../types";

function inputs(overrides: Partial<CalculatorInputs>): CalculatorInputs {
  return { ...DEFAULT_INPUTS, ...overrides };
}

describe("validateInputs", () => {
  it("reports no errors for the default inputs", () => {
    expect(validateInputs(DEFAULT_INPUTS)).toEqual({});
  });

  it("flags out-of-range percentages", () => {
    const e = validateInputs(
      inputs({ employeeContribPct: 150, inflationPct: -2 }),
    );
    expect(e.employeeContribPct).toBe("Must be at most 100");
    expect(e.inflationPct).toBe("Cannot be negative");
  });

  it("requires whole-number ages", () => {
    expect(validateInputs(inputs({ currentAge: 35.5 })).currentAge).toBe(
      "Must be a whole number",
    );
  });

  it("requires retirement age to be after current age", () => {
    expect(
      validateInputs(inputs({ currentAge: 50, retirementAge: 50 }))
        .retirementAge,
    ).toBe("Must be greater than current age");
    expect(
      validateInputs(inputs({ currentAge: 50, retirementAge: 45 }))
        .retirementAge,
    ).toBe("Must be greater than current age");
  });

  it("does not mask an out-of-range retirement age with the cross-field rule", () => {
    // 120 is past the max, so the range error should win, not the cross-field one.
    expect(validateInputs(inputs({ retirementAge: 120 })).retirementAge).toBe(
      "Must be at most 100",
    );
  });

  it("rejects an all-sources limit below the deferral limit", () => {
    expect(
      validateInputs(inputs({ deferralLimit: 24_500, allSourcesLimit: 20_000 }))
        .allSourcesLimit,
    ).toBe("Cannot be below the deferral limit");
  });

  it("requires life expectancy to be after retirement age", () => {
    expect(
      validateInputs(inputs({ retirementAge: 65, lifeExpectancy: 65 }))
        .lifeExpectancy,
    ).toBe("Must be greater than retirement age");
    expect(
      validateInputs(inputs({ retirementAge: 65, lifeExpectancy: 60 }))
        .lifeExpectancy,
    ).toBe("Must be greater than retirement age");
  });

  it("flags an out-of-range withdrawal rate", () => {
    expect(validateInputs(inputs({ withdrawalRate: 25 })).withdrawalRate).toBe(
      "Must be at most 20",
    );
    expect(validateInputs(inputs({ withdrawalRate: -1 })).withdrawalRate).toBe(
      "Cannot be negative",
    );
  });

  it("rejects a zero deferral limit", () => {
    expect(validateInputs(inputs({ deferralLimit: 0 })).deferralLimit).toBe(
      "Must be at least 1",
    );
  });
});
