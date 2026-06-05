import type { CalculatorInputs, ComparisonResult } from "../types";
import { realValue } from "../lib/calc";
import { fmtUSD } from "../lib/format";

interface ResultsSummaryProps {
  comparison: ComparisonResult;
  inputs: CalculatorInputs;
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "brand" | "roth";
}) {
  const color =
    accent === "roth"
      ? "text-roth-600"
      : accent === "brand"
        ? "text-brand-600"
        : "text-slate-900";
  return (
    <div>
      <div className="text-xs font-medium tracking-wide text-slate-500 uppercase">
        {label}
      </div>
      <div className={`tnum mt-1 text-2xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}

export function ResultsSummary({ comparison, inputs }: ResultsSummaryProps) {
  const { withMega, megaRothGain } = comparison;
  const years = Math.max(0, inputs.retirementAge - inputs.currentAge);
  const realTotal = realValue(withMega.finalTotal, inputs.inflationPct, years);
  const realMegaGain = realValue(megaRothGain, inputs.inflationPct, years);

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 p-6 text-white shadow-sm">
        <div className="text-sm font-medium text-brand-100">
          Projected balance at age {inputs.retirementAge}{" "}
          <span className="text-brand-100/70">({years} years)</span>
        </div>
        <div className="tnum mt-1 text-4xl font-bold sm:text-5xl">
          {fmtUSD(withMega.finalTotal)}
        </div>
        <div className="tnum mt-1 text-sm text-brand-100">
          {fmtUSD(realTotal)} in today&rsquo;s dollars ({inputs.inflationPct}%
          inflation)
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
          <div>
            <div className="text-xs text-brand-100">Pre-tax (Traditional)</div>
            <div className="tnum text-lg font-semibold">
              {fmtUSD(withMega.finalPretax)}
            </div>
          </div>
          <div>
            <div className="text-xs text-brand-100">Roth (tax-free)</div>
            <div className="tnum text-lg font-semibold">
              {fmtUSD(withMega.finalRoth)}
            </div>
          </div>
        </div>
      </div>

      {megaRothGain > 0 && (
        <div className="rounded-xl border border-roth-600/30 bg-roth-500/5 p-5">
          <div className="text-sm font-semibold text-roth-600">
            The mega-backdoor Roth adds {fmtUSD(megaRothGain)} of tax-free money
          </div>
          <p className="mt-1 text-sm text-slate-600">
            That is the extra Roth balance versus contributing nothing
            after-tax, all of it growing and (after conversion) withdrawn
            tax-free in retirement. About {fmtUSD(realMegaGain)} in
            today&rsquo;s dollars.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <Stat
          label="Total contributed"
          value={fmtUSD(withMega.totalContributed)}
        />
        <Stat
          label="Investment growth"
          value={fmtUSD(withMega.totalGrowth)}
          accent="brand"
        />
      </div>
    </div>
  );
}
