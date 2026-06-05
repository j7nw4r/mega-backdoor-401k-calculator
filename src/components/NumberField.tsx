interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** 'dollar' renders a leading $, 'percent' a trailing %, 'plain' neither. */
  affix?: "dollar" | "percent" | "plain";
  min?: number;
  max?: number;
  step?: number;
  /** Small grey hint shown under the field. */
  hint?: string;
}

/**
 * A labeled numeric input. Kept controlled and tolerant of transient empty
 * input (treated as 0) so typing never throws NaN into the engine.
 */
export function NumberField({
  label,
  value,
  onChange,
  affix = "plain",
  min = 0,
  max,
  step = 1,
  hint,
}: NumberFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1 flex items-center rounded-md border border-slate-300 bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
        {affix === "dollar" && (
          <span className="pl-3 text-slate-400 select-none">$</span>
        )}
        <input
          type="number"
          inputMode="decimal"
          className="tnum w-full bg-transparent px-3 py-2 text-right text-slate-900 outline-none"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const next = e.target.value === "" ? 0 : Number(e.target.value);
            onChange(Number.isFinite(next) ? next : 0);
          }}
        />
        {affix === "percent" && (
          <span className="pr-3 text-slate-400 select-none">%</span>
        )}
      </div>
      {hint && (
        <span className="mt-1 block text-xs text-slate-400">{hint}</span>
      )}
    </label>
  );
}
