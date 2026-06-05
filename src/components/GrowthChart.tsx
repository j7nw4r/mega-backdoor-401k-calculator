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
import { fmtUSD } from "../lib/format";

interface GrowthChartProps {
  projection: ProjectionResult;
}

/** Compact axis labels: $2.4M, $750k, $0. */
function compactUSD(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}k`;
  return `$${Math.round(value)}`;
}

export function GrowthChart({ projection }: GrowthChartProps) {
  const data = projection.rows.map((r) => ({
    age: r.age,
    Pretax: Math.round(r.pretaxBalance),
    Roth: Math.round(r.rothBalance),
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        Set a retirement age beyond your current age to see the projection.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
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
  );
}
