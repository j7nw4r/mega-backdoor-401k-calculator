import type { ReactNode } from "react";
import type { CalculatorInputs } from "../types";
import { LIMITS_YEAR } from "../lib/irs";
import { NumberField } from "./NumberField";

interface InputsPanelProps {
  inputs: CalculatorInputs;
  setField: (key: keyof CalculatorInputs, value: number) => void;
  onReset: () => void;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {title}
      </legend>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function InputsPanel({ inputs, setField, onReset }: InputsPanelProps) {
  const set = (key: keyof CalculatorInputs) => (v: number) => setField(key, v);

  return (
    <div className="space-y-8">
      <Section title="You & timeline">
        <NumberField
          label="Current age"
          value={inputs.currentAge}
          onChange={set("currentAge")}
          min={16}
          max={99}
        />
        <NumberField
          label="Retirement age"
          value={inputs.retirementAge}
          onChange={set("retirementAge")}
          min={inputs.currentAge + 1}
          max={100}
        />
        <NumberField
          label="Current pre-tax balance"
          value={inputs.currentBalancePretax}
          onChange={set("currentBalancePretax")}
          affix="dollar"
          step={1000}
        />
        <NumberField
          label="Current Roth balance"
          value={inputs.currentBalanceRoth}
          onChange={set("currentBalanceRoth")}
          affix="dollar"
          step={1000}
        />
      </Section>

      <Section title="Income">
        <NumberField
          label="Annual salary"
          value={inputs.annualSalary}
          onChange={set("annualSalary")}
          affix="dollar"
          step={1000}
        />
        <NumberField
          label="Annual raise"
          value={inputs.salaryIncreasePct}
          onChange={set("salaryIncreasePct")}
          affix="percent"
          step={0.5}
          max={25}
        />
      </Section>

      <Section title="Contributions & match">
        <NumberField
          label="Your pre-tax contribution"
          value={inputs.employeeContribPct}
          onChange={set("employeeContribPct")}
          affix="percent"
          step={1}
          max={100}
          hint="% of pay, capped at the 402(g) limit"
        />
        <div className="hidden sm:block" />
        <NumberField
          label="Employer match"
          value={inputs.employerMatchPct}
          onChange={set("employerMatchPct")}
          affix="percent"
          step={5}
          max={200}
          hint="e.g. 50% = 50 cents per dollar"
        />
        <NumberField
          label="Match limit"
          value={inputs.employerMatchLimitPct}
          onChange={set("employerMatchLimitPct")}
          affix="percent"
          step={0.5}
          max={100}
          hint="up to this % of pay"
        />
      </Section>

      <Section title="Mega-backdoor Roth (after-tax)">
        <NumberField
          label="After-tax contribution"
          value={inputs.afterTaxContribPct}
          onChange={set("afterTaxContribPct")}
          affix="percent"
          step={1}
          max={100}
          hint="% of pay, auto-capped to the 415(c) room"
        />
        <div className="hidden sm:block" />
      </Section>

      <Section title="Growth">
        <NumberField
          label="Annual rate of return"
          value={inputs.rateOfReturnPct}
          onChange={set("rateOfReturnPct")}
          affix="percent"
          step={0.5}
          max={20}
          hint="S&P 500 has averaged ~10% long-term"
        />
        <div className="hidden sm:block" />
      </Section>

      <details className="group rounded-lg border border-slate-200 bg-slate-50 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-600 select-none">
          Advanced: IRS limits ({LIMITS_YEAR})
        </summary>
        <p className="mt-2 mb-4 text-xs text-slate-500">
          Defaults are the {LIMITS_YEAR} figures. Edit them to model a different
          year or plan.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="Elective deferral limit (402(g))"
            value={inputs.deferralLimit}
            onChange={set("deferralLimit")}
            affix="dollar"
            step={500}
          />
          <NumberField
            label="All-sources limit (415(c))"
            value={inputs.allSourcesLimit}
            onChange={set("allSourcesLimit")}
            affix="dollar"
            step={1000}
          />
          <NumberField
            label="Compensation cap (401(a)(17))"
            value={inputs.compCap}
            onChange={set("compCap")}
            affix="dollar"
            step={5000}
          />
          <NumberField
            label="Catch-up (age 50+)"
            value={inputs.catchUp50}
            onChange={set("catchUp50")}
            affix="dollar"
            step={500}
          />
          <NumberField
            label="Super catch-up (age 60-63)"
            value={inputs.catchUp6063}
            onChange={set("catchUp6063")}
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
