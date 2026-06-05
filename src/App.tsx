import { useMemo, useState } from "react";
import type { CalculatorInputs } from "./types";
import { compare } from "./lib/calc";
import { DEFAULT_INPUTS } from "./lib/defaults";
import { InputsPanel } from "./components/InputsPanel";
import { ResultsSummary } from "./components/ResultsSummary";
import { GrowthChart } from "./components/GrowthChart";
import { YearByYearTable } from "./components/YearByYearTable";
import { AssumptionsDisclosure } from "./components/AssumptionsDisclosure";

const REPO_URL = "https://github.com/j7nw4r/mega-backdoor-401k-calculator";
const ISSUES_URL = `${REPO_URL}/issues`;

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export default function App() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  const setField = (key: keyof CalculatorInputs, value: number) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  // Pure and fast; memoized so it only recomputes when an input changes.
  const comparison = useMemo(() => compare(inputs), [inputs]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Mega-Backdoor 401(k) Calculator
            </h1>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <GitHubIcon className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
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

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <section className="rounded-xl border border-slate-200 bg-white p-5 lg:sticky lg:top-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Your details
              </h2>
              <InputsPanel
                inputs={inputs}
                setField={setField}
                onReset={() => setInputs(DEFAULT_INPUTS)}
              />
            </section>
          </aside>

          <div className="space-y-6 lg:col-span-8">
            <ResultsSummary comparison={comparison} inputs={inputs} />
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <GrowthChart
                projection={comparison.withMega}
                inflationPct={inputs.inflationPct}
                currentAge={inputs.currentAge}
              />
            </section>
            <YearByYearTable projection={comparison.withMega} />
            <AssumptionsDisclosure />
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>
          Educational tool, not tax advice. Limits default to 2026 IRS figures.
        </p>
        <p className="mt-2">
          Open source on{" "}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-brand-600 hover:underline"
          >
            GitHub
          </a>
          . Found a bug or have a suggestion?{" "}
          <a
            href={ISSUES_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-brand-600 hover:underline"
          >
            Open an issue
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
