import type { ReactNode } from "react";
import type { CalculatorInputs } from "../types";
import { deferralInfo } from "../lib/calc";
import { fmtUSD } from "../lib/format";
import { LIMITS_YEAR } from "../lib/irs";
import { validateInputs } from "../lib/validation";
import { NumberField } from "./NumberField";

interface InputsPanelProps {
  inputs: CalculatorInputs;
  setField: (key: keyof CalculatorInputs, value: number) => void;
  onReset: () => void;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {title}
      </legend>
      <div className="space-y-3">{children}</div>
    </fieldset>
  );
}

/** Shows the pre-tax (402(g)) limit currently being applied next to the
 *  contribution input, including age catch-up and whether the elected percent
 *  is being capped. Derived from the same rule the projection engine uses. */
function DeferralLimitNote({ inputs }: { inputs: CalculatorInputs }) {
  const info = deferralInfo(inputs);

  const catchUpText =
    info.catchUp === 0
      ? `${LIMITS_YEAR} elective-deferral limit (402(g))`
      : `${fmtUSD(info.baseLimit)} + ${fmtUSD(info.catchUp)} ${
          inputs.currentAge >= 60 && inputs.currentAge <= 63
            ? "age 60-63 catch-up"
            : "age 50+ catch-up"
        }`;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-medium tracking-wide text-slate-500 uppercase">
        Pre-tax limit applied
      </div>
      <div className="tnum mt-0.5 text-lg font-semibold text-slate-900">
        {fmtUSD(info.effectiveLimit)}
        <span className="text-xs font-normal text-slate-400">/yr</span>
      </div>
      <div className="mt-0.5 text-xs text-slate-500">{catchUpText}</div>
      <div
        className={`mt-1 text-xs ${info.isCapped ? "text-amber-600" : "text-roth-600"}`}
      >
        {info.isCapped
          ? `Your ${inputs.employeeContribPct}% is ${fmtUSD(info.desired)}/yr, capped to the limit.`
          : `Your ${inputs.employeeContribPct}% is about ${fmtUSD(info.desired)}/yr this year.`}
      </div>
    </div>
  );
}

export function InputsPanel({ inputs, setField, onReset }: InputsPanelProps) {
  const errors = validateInputs(inputs);

  // Bundle the value, change handler, and any validation error for a field, so
  // each NumberField can be wired with a single spread.
  const field = (key: keyof CalculatorInputs) => ({
    value: inputs[key],
    onChange: (v: number) => setField(key, v),
    error: errors[key],
  });

  return (
    <div className="space-y-5">
      <Section title="You & timeline">
        <NumberField
          label="Current age"
          {...field("currentAge")}
          min={16}
          max={99}
        />
        <NumberField
          label="Retirement age"
          {...field("retirementAge")}
          min={inputs.currentAge + 1}
          max={100}
        />
        <NumberField
          label="Current pre-tax balance"
          {...field("currentBalancePretax")}
          affix="dollar"
          step={1000}
        />
        <NumberField
          label="Current Roth balance"
          {...field("currentBalanceRoth")}
          affix="dollar"
          step={1000}
        />
      </Section>

      <Section title="Income">
        <NumberField
          label="Annual salary"
          {...field("annualSalary")}
          affix="dollar"
          step={1000}
        />
        <NumberField
          label="Annual raise"
          {...field("salaryIncreasePct")}
          affix="percent"
          step={0.5}
          max={25}
        />
      </Section>

      <Section title="Contributions & match">
        <NumberField
          label="Your pre-tax contribution"
          {...field("employeeContribPct")}
          affix="percent"
          step={1}
          max={100}
          hint="% of pay, capped at the 402(g) limit"
        />
        <DeferralLimitNote inputs={inputs} />
        <NumberField
          label="Employer match"
          {...field("employerMatchPct")}
          affix="percent"
          step={5}
          max={200}
          hint="e.g. 50% = 50 cents per dollar"
        />
        <NumberField
          label="Match limit"
          {...field("employerMatchLimitPct")}
          affix="percent"
          step={0.5}
          max={100}
          hint="up to this % of pay"
        />
      </Section>

      <Section title="Mega-backdoor Roth (after-tax)">
        <NumberField
          label="After-tax contribution"
          {...field("afterTaxContribPct")}
          affix="percent"
          step={1}
          max={100}
          hint="% of pay, auto-capped to the 415(c) room"
        />
      </Section>

      <Section title="Growth">
        <NumberField
          label="Annual rate of return"
          {...field("rateOfReturnPct")}
          affix="percent"
          step={0.5}
          max={20}
          hint="S&P 500 has averaged ~10% long-term"
        />
        <NumberField
          label="Inflation rate"
          {...field("inflationPct")}
          affix="percent"
          step={0.5}
          max={15}
          hint="used to show today's-dollar values"
        />
      </Section>

      <details className="group rounded-lg border border-slate-200 bg-slate-50 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-600 select-none">
          Advanced: IRS limits ({LIMITS_YEAR})
        </summary>
        <p className="mt-2 mb-4 text-xs text-slate-500">
          Defaults are the {LIMITS_YEAR} figures. Edit them to model a different
          year or plan.
        </p>
        <div className="space-y-3">
          <NumberField
            label="Elective deferral limit (402(g))"
            {...field("deferralLimit")}
            affix="dollar"
            step={500}
          />
          <NumberField
            label="All-sources limit (415(c))"
            {...field("allSourcesLimit")}
            affix="dollar"
            step={1000}
          />
          <NumberField
            label="Compensation cap (401(a)(17))"
            {...field("compCap")}
            affix="dollar"
            step={5000}
          />
          <NumberField
            label="Catch-up (age 50+)"
            {...field("catchUp50")}
            affix="dollar"
            step={500}
          />
          <NumberField
            label="Super catch-up (age 60-63)"
            {...field("catchUp6063")}
            affix="dollar"
            step={500}
          />
        </div>
      </details>

      <button
        type="button"
        onClick={onReset}
        className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
      >
        Reset to defaults
      </button>
    </div>
  );
}
