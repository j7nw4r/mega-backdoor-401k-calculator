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

// Thousands-separated display, e.g. 200000 -> "200,000", 7.5 -> "7.5". Keeps a
// generous decimal allowance so percent/step values aren't truncated.
const grouped = new Intl.NumberFormat("en-US", { maximumFractionDigits: 10 });
const formatGrouped = (value: number) => grouped.format(value);

// Parse a possibly comma-grouped, mid-edit string to a number. Empty and a lone
// "-" map to 0 so the engine never sees NaN while the user is still typing.
function parse(raw: string): number {
  const cleaned = raw.replace(/,/g, "");
  if (cleaned === "" || cleaned === "-") return 0;
  return Number(cleaned);
}

/**
 * A labeled numeric input that shows thousands separators.
 *
 * Because `<input type="number">` refuses to display grouping commas, this is a
 * text input with `inputMode="decimal"` (so touch keyboards still show digits)
 * and manual parsing. The display string is decoupled from the numeric model so
 * the field can hold transient states while typing ("", "1.", "200,") without
 * the engine ever seeing NaN: we show grouped digits while idle, strip to a
 * plain editable string on focus, and re-group on blur. Arrow Up/Down still
 * step by `step` (clamped to min/max), replacing the native spinner we lose by
 * leaving `type="number"`. Range validation lives in validateInputs.
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
  const [text, setText] = useState<string>(() => formatGrouped(value));
  const [lastValue, setLastValue] = useState(value);
  const [focused, setFocused] = useState(false);
  const id = useId();
  const descId = `${id}-desc`;

  // Re-sync the visible text when the numeric value changes from the outside
  // (e.g. "Reset to defaults"). Adjusting state during render by comparing the
  // previous prop is React's recommended alternative to a syncing effect. While
  // the field is focused we leave the user's in-progress string alone; the inner
  // guard does the same when value and text already agree numerically.
  if (value !== lastValue) {
    setLastValue(value);
    if (!focused && parse(text) !== value) setText(formatGrouped(value));
  }

  const borderClasses = error
    ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-100"
    : "border-slate-300 focus-within:border-brand-500 focus-within:ring-brand-100";

  // Arrow Up/Down nudge the value by one step, clamped to the field's bounds,
  // standing in for the native number-spinner that text inputs don't provide.
  const stepBy = (dir: 1 | -1) => {
    const base = parse(text);
    let next = Math.round((base + dir * step) * 1e6) / 1e6;
    next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    onChange(next);
    setText(String(next));
  };

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
          type="text"
          inputMode="decimal"
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? descId : undefined}
          className="tnum w-full bg-transparent px-3 py-1.5 text-right text-slate-900 outline-none"
          value={text}
          onFocus={() => {
            setFocused(true);
            // Show a plain, comma-free string so editing in the middle of the
            // number doesn't fight cursor jumps from re-inserted separators.
            setText(String(value));
          }}
          onChange={(e) => {
            const raw = e.target.value;
            setText(raw);
            const next = parse(raw);
            if (Number.isFinite(next)) onChange(next);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              stepBy(1);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              stepBy(-1);
            }
          }}
          onBlur={() => {
            setFocused(false);
            setText(formatGrouped(value));
          }}
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
