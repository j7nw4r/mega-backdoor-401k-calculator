import { useMemo, useState } from "react";
import type { CalculatorInputs } from "./types";
import { compare } from "./lib/calc";
import { DEFAULT_INPUTS } from "./lib/defaults";
import { InputsPanel } from "./components/InputsPanel";
import { ResultsSummary } from "./components/ResultsSummary";
import { GrowthChart } from "./components/GrowthChart";
import { YearByYearTable } from "./components/YearByYearTable";
import { AssumptionsDisclosure } from "./components/AssumptionsDisclosure";

export default function App() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  const setField = (key: keyof CalculatorInputs, value: number) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  // Pure and fast; memoized so it only recomputes when an input changes.
  const comparison = useMemo(() => compare(inputs), [inputs]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Mega-Backdoor 401(k) Calculator
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Project your 401(k) to retirement, including after-tax{" "}
            <span className="font-medium text-roth-600">
              mega-backdoor Roth
            </span>{" "}
            contributions that ordinary calculators leave out. See how much
            extra tax-free money the strategy adds.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-6 text-lg font-semibold text-slate-900">
              Your details
            </h2>
            <InputsPanel
              inputs={inputs}
              setField={setField}
              onReset={() => setInputs(DEFAULT_INPUTS)}
            />
          </section>

          <section className="space-y-8">
            <ResultsSummary comparison={comparison} inputs={inputs} />
          </section>
        </div>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Balance growth
          </h2>
          <GrowthChart projection={comparison.withMega} />
        </section>

        <div className="mt-8 space-y-6">
          <YearByYearTable projection={comparison.withMega} />
          <AssumptionsDisclosure />
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        Educational tool, not tax advice. Limits default to 2026 IRS figures.
      </footer>
    </div>
  );
}
