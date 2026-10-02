/**
 * Price and date formatting for visitors, in the page's language. Pure functions (no JCR, no
 * React), unit-tested in format.test.ts.
 */

/** ISO 4217 codes the content model offers (ctrvmix:price currency choicelist). */
const CURRENCY = /^[A-Z]{3}$/;

export interface FormattedPrice {
  /** What the eye reads: "HKD 1,280" (en), "1 280 HKD" (fr). */
  visual: string;
  /** What a screen reader reads: "1,280 Hong Kong dollars", "1 280 dollars de Hong Kong". */
  spoken: string;
}

/** Whole amounts are written without decimals ("HKD 1,280", not "HKD 1,280.00"). */
const digits = (amount: number) =>
  Number.isInteger(amount) ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {};

/**
 * A price in the page's language, with the currency as its code for the eye and spelled out for
 * screen readers (a code such as "HKD" is read letter by letter). Undefined when there is no valid
 * amount or currency, so a view never shows half a price.
 */
export const formatPrice = (
  amount: number | undefined,
  currency: string | undefined,
  language: string,
): FormattedPrice | undefined => {
  if (amount === undefined || !Number.isFinite(amount) || amount < 0) return undefined;
  if (!currency || !CURRENCY.test(currency)) return undefined;
  try {
    const format = (currencyDisplay: "code" | "name") =>
      new Intl.NumberFormat(language, {
        style: "currency",
        currency,
        currencyDisplay,
        ...digits(amount),
      }).format(amount);
    return { visual: format("code"), spoken: format("name") };
  } catch {
    const plain = `${currency} ${amount}`;
    return { visual: plain, spoken: plain };
  }
};

/** The date part of an ISO string ("2026-11-30"), for <time dateTime> and comparisons. */
export const isoDay = (iso: string | undefined): string | undefined => {
  const day = iso?.slice(0, 10);
  return day && /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : undefined;
};

/**
 * A date for visitors ("30 Nov 2026" / "30 nov. 2026" in "medium", "30 November 2026" in "long").
 *
 * Formats the CALENDAR day the editor picked (the date part of the ISO string), in UTC: parsing the
 * instant and formatting it in the server's time zone shows the day before on a UTC server for a
 * date picked at midnight in Paris. Falls back to the date part if the runtime cannot format it.
 */
export const formatDate = (
  iso: string | undefined,
  language: string,
  style: "medium" | "long" = "long",
): string | undefined => {
  const day = isoDay(iso);
  if (!day) return undefined;
  const date = new Date(`${day}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return day;
  try {
    return new Intl.DateTimeFormat(language, { dateStyle: style, timeZone: "UTC" }).format(date);
  } catch {
    return day;
  }
};

/** Today's calendar day in UTC ("2026-10-01"). */
export const today = (now: Date = new Date()): string => now.toISOString().slice(0, 10);

/**
 * True when the last day of the sale is before `day` (the sale runs through its last day). An
 * offer without an end of sale never ends.
 */
export const isSaleOver = (saleEnds: string | undefined, day: string): boolean => {
  const end = isoDay(saleEnds);
  return end !== undefined && end < day;
};

/** Which sentence describes a travel period: both bounds, only one, or none. */
export type PeriodKind = "range" | "from" | "until" | "none";

export const periodKind = (from: string | undefined, to: string | undefined): PeriodKind => {
  const start = isoDay(from);
  const end = isoDay(to);
  if (start && end) return "range";
  if (start) return "from";
  if (end) return "until";
  return "none";
};
