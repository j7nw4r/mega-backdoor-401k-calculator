import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProjectionResult } from "../types";
import { realValue } from "../lib/calc";
import { fmtUSD } from "../lib/format";

interface GrowthChartProps {
  projection: ProjectionResult;
  /** Inflation rate used for the today's-dollars view. */
  inflationPct: number;
  /** Age at the start of the projection, the discount baseline. */
  currentAge: number;
}

/** Compact axis labels: $2.4M, $750k, $0. */
function compactUSD(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}k`;
  return `$${Math.round(value)}`;
}

function Toggle({
  real,
  onChange,
}: {
  real: boolean;
  onChange: (real: boolean) => void;
}) {
  const base = "rounded px-2.5 py-1 text-xs font-medium transition-colors";
  const on = "bg-brand-600 text-white";
  const off = "text-slate-600 hover:text-slate-900";
  return (
    <div className="inline-flex rounded-md border border-slate-300 p-0.5">
      <button
        type="button"
        className={`${base} ${real ? off : on}`}
        onClick={() => onChange(false)}
      >
        Nominal
      </button>
      <button
        type="button"
        className={`${base} ${real ? on : off}`}
        onClick={() => onChange(true)}
      >
        Today&rsquo;s dollars
      </button>
    </div>
  );
}

export function GrowthChart({
  projection,
  inflationPct,
  currentAge,
}: GrowthChartProps) {
  const [real, setReal] = useState(false);

  // In today's-dollars mode, discount each year's balance by the years elapsed
  // from now to that age, so the curve reflects purchasing power over time.
  const adjust = (value: number, age: number) =>
    real ? realValue(value, inflationPct, age - currentAge) : value;

  const data = projection.rows.map((r) => ({
    age: r.age,
    Pretax: Math.round(adjust(r.pretaxBalance, r.age)),
    Roth: Math.round(adjust(r.rothBalance, r.age)),
  }));

  const header = (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-lg font-semibold text-slate-900">Balance growth</h2>
      <Toggle real={real} onChange={setReal} />
    </div>
  );

  if (data.length === 0) {
    return (
      <>
        {header}
        <div className="flex h-64 items-center justify-center text-sm text-slate-400">
          Set a retirement age beyond your current age to see the projection.
        </div>
      </>
    );
  }

  return (
    <>
      {header}
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 4, left: 8 }}
        >
          <defs>
            <linearGradient id="fillPretax" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.85} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0.35} />
            </linearGradient>
            <linearGradient id="fillRoth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity={0.85} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0.35} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="age"
            tick={{ fontSize: 12, fill: "#64748b" }}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
            label={{
              value: "Age",
              position: "insideBottom",
              offset: -2,
              fontSize: 12,
              fill: "#64748b",
            }}
          />
          <YAxis
            tickFormatter={compactUSD}
            tick={{ fontSize: 12, fill: "#64748b" }}
            tickLine={false}
            width={56}
          />
          <Tooltip
            formatter={(value, name) => [fmtUSD(Number(value)), name]}
            labelFormatter={(age) => `Age ${age}`}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 13,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Area
            type="monotone"
            dataKey="Pretax"
            stackId="1"
            stroke="#1d4ed8"
            fill="url(#fillPretax)"
            name="Pre-tax (Traditional)"
          />
          <Area
            type="monotone"
            dataKey="Roth"
            stackId="1"
            stroke="#047857"
            fill="url(#fillRoth)"
            name="Roth (mega-backdoor)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
}
