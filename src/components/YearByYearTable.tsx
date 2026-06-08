import type { ProjectionResult } from "../types";
import { fmtUSD } from "../lib/format";

interface YearByYearTableProps {
  projection: ProjectionResult;
}

export function YearByYearTable({ projection }: YearByYearTableProps) {
  if (projection.rows.length === 0) return null;

  return (
    <details className="rounded-xl border border-slate-200 bg-white">
      <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-slate-700 select-none">
        Year-by-year breakdown
      </summary>
      <div className="max-h-96 overflow-auto border-t border-slate-100">
        <table className="tnum w-full text-right text-sm">
          <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Age</th>
              <th className="px-4 py-2 font-medium">Salary</th>
              <th className="px-4 py-2 font-medium">Deferral</th>
              <th className="px-4 py-2 font-medium">Match</th>
              <th className="px-4 py-2 font-medium">After-tax</th>
              <th className="px-4 py-2 font-medium">Withdrawal</th>
              <th className="px-4 py-2 font-medium">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projection.rows.map((r) => {
              const isDrawdown = r.phase === "drawdown";
              // Mute the zero cells that do not apply to this phase so the eye
              // tracks the one number that is changing.
              const muted = "px-4 py-2 text-slate-300";
              return (
                <tr
                  key={r.age}
                  className={
                    isDrawdown
                      ? "bg-amber-50/50 text-slate-700 hover:bg-amber-50"
                      : "text-slate-700 hover:bg-slate-50"
                  }
                >
                  <td className="px-4 py-2 text-left font-medium">{r.age}</td>
                  <td className={isDrawdown ? muted : "px-4 py-2"}>
                    {fmtUSD(r.salary)}
                  </td>
                  <td className={isDrawdown ? muted : "px-4 py-2"}>
                    {fmtUSD(r.deferral)}
                  </td>
                  <td className={isDrawdown ? muted : "px-4 py-2"}>
                    {fmtUSD(r.match)}
                  </td>
                  <td
                    className={isDrawdown ? muted : "px-4 py-2 text-roth-600"}
                  >
                    {fmtUSD(r.afterTax)}
                  </td>
                  <td
                    className={isDrawdown ? "px-4 py-2 text-amber-700" : muted}
                  >
                    {fmtUSD(r.withdrawal)}
                  </td>
                  <td className="px-4 py-2 font-semibold text-slate-900">
                    {fmtUSD(r.totalBalance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </details>
  );
}
