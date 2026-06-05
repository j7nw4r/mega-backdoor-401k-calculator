import { useId, useState } from "react";

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
  /** Validation message; when set, the field shows a red error state. */
  error?: string;
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
  error,
}: NumberFieldProps) {
  const [text, setText] = useState<string>(() => String(value));
  const [lastValue, setLastValue] = useState(value);
  const id = useId();
  const descId = `${id}-desc`;

  // Re-sync the visible text when the numeric value changes from the outside
  // (e.g. "Reset to defaults"). Adjusting state during render by comparing the
  // previous prop is React's recommended alternative to a syncing effect. The
  // inner guard means normal typing, where value and text already agree
  // numerically, leaves the user's in-progress string (e.g. "" or "05") alone.
  if (value !== lastValue) {
    setLastValue(value);
    if (Number(text) !== value) setText(String(value));
  }

  const borderClasses = error
    ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-100"
    : "border-slate-300 focus-within:border-brand-500 focus-within:ring-brand-100";

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div
        className={`mt-1 flex items-center rounded-md border bg-white focus-within:ring-2 ${borderClasses}`}
      >
        {affix === "dollar" && (
          <span className="pl-3 text-slate-400 select-none">$</span>
        )}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? descId : undefined}
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
      {error ? (
        <span
          id={descId}
          className="mt-1 block text-xs font-medium text-red-600"
        >
          {error}
        </span>
      ) : hint ? (
        <span id={descId} className="mt-1 block text-xs text-slate-400">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
