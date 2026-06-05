import { useState } from "react";

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
 * A labeled numeric input.
 *
 * The display string is decoupled from the numeric model so the field can hold
 * transient states while typing ("", "1.", a freshly cleared field) without the
 * engine ever seeing NaN. We emit a parsed number on every change and normalize
 * the visible string on blur. This is what lets you clear a field instead of
 * being stuck with a leading "0" that reappears on every keystroke.
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
  const [text, setText] = useState<string>(() => String(value));
  const [lastValue, setLastValue] = useState(value);

  // Re-sync the visible text when the numeric value changes from the outside
  // (e.g. "Reset to defaults"). Adjusting state during render by comparing the
  // previous prop is React's recommended alternative to a syncing effect. The
  // inner guard means normal typing, where value and text already agree
  // numerically, leaves the user's in-progress string (e.g. "" or "05") alone.
  if (value !== lastValue) {
    setLastValue(value);
    if (Number(text) !== value) setText(String(value));
  }

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
          className="tnum w-full bg-transparent px-3 py-1.5 text-right text-slate-900 outline-none"
          value={text}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const raw = e.target.value;
            setText(raw);
            const next = raw === "" ? 0 : Number(raw);
            if (Number.isFinite(next)) onChange(next);
          }}
          onBlur={() => setText(String(value))}
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
