/**
 * Which fare offers and destinations a list shows, and in which order. Pure functions over plain
 * values (the JCR reading is in lib/travel.ts), unit-tested in select.test.ts.
 *
 * Filtering and sorting happen here rather than in JCR-SQL2: the region of a fare is the region of
 * its destination (another node), the destination order is by the destination's title in the
 * page's language, and offers whose sale has ended depend on today's date.
 */
import { isSaleOver, isoDay } from "./format.js";

/** Regions of the content model (ctrv:destination region choicelist). */
export const REGIONS = [
  "greaterChina",
  "japanKorea",
  "southeastAsia",
  "southAsia",
  "oceania",
  "europe",
  "northAmerica",
  "other",
] as const;
export type Region = (typeof REGIONS)[number];
const REGION_SET = new Set<string>(REGIONS);

export const FARE_SORTS = ["priceAsc", "saleEndsAsc", "destinationAsc"] as const;
export type FareSort = (typeof FARE_SORTS)[number];
const SORT_SET = new Set<string>(FARE_SORTS);

/** A region filter: a known region, or "all" for anything else (unset, unknown value). */
export const regionFilter = (value: string | undefined): Region | "all" =>
  value && REGION_SET.has(value) ? (value as Region) : "all";

/** A fare sort: a known one, or price ascending. */
export const fareSort = (value: string | undefined): FareSort =>
  value && SORT_SET.has(value) ? (value as FareSort) : "priceAsc";

/** The number of items a list shows: 1 to 50, `fallback` when unset or not a number. */
export const maxItems = (value: unknown, fallback = 6): number => {
  const n = Math.trunc(Number(value));
  return Math.min(Math.max(Number.isFinite(n) && n > 0 ? n : fallback, 1), 50);
};

export interface FareEntry {
  id: string;
  price?: number;
  /** ISO 8601 date of the last day of the sale. */
  saleEnds?: string;
  /** Title of the destination, in the page's language. */
  destinationTitle?: string;
  /** Region of the destination. */
  region?: string;
}

export interface DestinationEntry {
  id: string;
  title?: string;
  region?: string;
}

/** Compares two strings in the page's language (an Intl.Collator's compare). */
export type Compare = (a: string, b: string) => number;

/** Missing values sort last, whatever the direction. */
const missingLast = <T>(a: T | undefined, b: T | undefined, compare: (x: T, y: T) => number) => {
  if (a === undefined && b === undefined) return 0;
  if (a === undefined) return 1;
  if (b === undefined) return -1;
  return compare(a, b);
};

const byNumber = (a: number, b: number) => a - b;
const byDay = (a: string, b: string) => (a < b ? -1 : Number(a > b));

const fareComparator = (sort: FareSort, compare: Compare) => {
  const price = (a: FareEntry, b: FareEntry) => missingLast(a.price, b.price, byNumber);
  const saleEnds = (a: FareEntry, b: FareEntry) =>
    missingLast(isoDay(a.saleEnds), isoDay(b.saleEnds), byDay);
  const destination = (a: FareEntry, b: FareEntry) =>
    missingLast(a.destinationTitle, b.destinationTitle, compare);
  const order = {
    priceAsc: [price, destination],
    saleEndsAsc: [saleEnds, price, destination],
    destinationAsc: [destination, price],
  }[sort];
  return (a: FareEntry, b: FareEntry) => {
    for (const step of order) {
      const result = step(a, b);
      if (result !== 0) return result;
    }
    return 0;
  };
};

export interface FareSelection<T extends FareEntry> {
  items: T[];
  /** Offers left out because their sale has ended. */
  ended: number;
  /** Offers left out because their destination is in another region. */
  otherRegion: number;
}

/**
 * The fare offers a list shows: in the region (of their destination) when one is chosen, still on
 * sale on `day` unless `keepEnded`, sorted, at most `max`.
 */
export const selectFares = <T extends FareEntry>(
  entries: T[],
  {
    region,
    sort,
    max,
    day,
    compare,
    keepEnded = false,
  }: {
    region: Region | "all";
    sort: FareSort;
    max: number;
    day: string;
    compare: Compare;
    keepEnded?: boolean;
  },
): FareSelection<T> => {
  let ended = 0;
  let otherRegion = 0;
  const kept: T[] = [];
  for (const entry of entries) {
    if (region !== "all" && entry.region !== region) otherRegion++;
    else if (!keepEnded && isSaleOver(entry.saleEnds, day)) ended++;
    else kept.push(entry);
  }
  kept.sort(fareComparator(sort, compare));
  return { items: kept.slice(0, max), ended, otherRegion };
};

/** The destinations a grid shows: in the region when one is chosen, A to Z, at most `max`. */
export const selectDestinations = <T extends DestinationEntry>(
  entries: T[],
  { region, max, compare }: { region: Region | "all"; max: number; compare: Compare },
): T[] =>
  entries
    .filter((entry) => region === "all" || entry.region === region)
    .sort((a, b) => missingLast(a.title, b.title, compare))
    .slice(0, max);
