import { LIMITS_YEAR } from "../lib/irs";

/** Spells out the modeling assumptions and the not-tax-advice disclaimer. */
export function AssumptionsDisclosure() {
  return (
    <details className="rounded-xl border border-slate-200 bg-white">
      <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-slate-700 select-none">
        Assumptions & disclaimer
      </summary>
      <div className="space-y-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-600">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Contributions are made monthly and the balance compounds monthly at
            your annual rate divided by 12.
          </li>
          <li>
            Contributions run until the year before your retirement age; the
            retirement year itself has no contributions.
          </li>
          <li>
            "Today&rsquo;s dollars" figures discount the projected balance by
            your inflation rate over the years to retirement (real = nominal /
            (1 + inflation)^years), showing its purchasing power in current
            dollars.
          </li>
          <li>
            Your salary grows once per year by the raise percentage and is
            capped at the 401(a)(17) compensation limit for plan math.
          </li>
          <li>
            The after-tax (mega-backdoor) amount is automatically capped to the
            415(c) room: the all-sources limit (plus any age catch-up) minus
            your deferral and the employer match. It assumes your plan allows
            after-tax contributions and in-plan Roth conversion / in-service
            withdrawals.
          </li>
          <li>
            Employer match is the match rate applied to the lesser of your
            contribution rate and the match-limit rate. Real plans may differ
            (true-ups, vesting schedules).
          </li>
          <li>
            In retirement, the first-year withdrawal is your withdrawal rate
            applied to the balance at retirement (the "4% rule"); that dollar
            amount then grows with inflation each year so your spending power
            stays level. Withdrawals are taken pro-rata from the pre-tax and
            Roth buckets, and the remainder compounds monthly at your
            in-retirement return through your life expectancy. Taxes on pre-tax
            withdrawals and Required Minimum Distributions are not modeled.
          </li>
          <li>
            Default limits are the {LIMITS_YEAR} IRS figures and are editable
            under “Advanced.” Catch-up contributions apply automatically by age.
          </li>
        </ul>
        <p className="text-xs text-slate-400">
          This tool is for educational purposes only and is not tax, legal, or
          investment advice. Verify limits and your plan’s rules with the IRS
          and your plan administrator before acting.
        </p>
      </div>
    </details>
  );
}
