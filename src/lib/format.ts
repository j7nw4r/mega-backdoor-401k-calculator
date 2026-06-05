// Display formatting helpers.

const currency0 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const currency2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Whole-dollar currency, e.g. $1,234,567. */
export function fmtUSD(value: number): string {
  return currency0.format(Math.round(value));
}

/** Cent-precision currency, e.g. $1,234.56. */
export function fmtUSDCents(value: number): string {
  return currency2.format(value);
}

/** Percent with up to one decimal, e.g. 7% or 7.5%. */
export function fmtPct(value: number): string {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
}
