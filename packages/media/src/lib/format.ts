/**
 * Dates, times, reading time and sort keys for visitors, in the page's language. Pure functions (no
 * JCR, no React), unit-tested in format.test.ts.
 */

/** The date part of an ISO string ("2026-11-30"), for <time dateTime> and comparisons. */
export const isoDay = (iso: string | undefined): string | undefined => {
  const day = iso?.slice(0, 10);
  return day && /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : undefined;
};

/**
 * A calendar day for visitors ("30 November 2026" in "long", "Tuesday 30 November 2026" in
 * "full"). Formats the CALENDAR day the editor picked (the date part of the ISO string), in UTC:
 * parsing the instant and formatting it in the server's zone shows the day before for a date picked
 * at midnight in Paris. Falls back to the date part if the runtime cannot format it.
 */
export const formatDate = (
  iso: string | undefined,
  language: string,
  style: "medium" | "long" | "full" = "long",
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

/** An IANA time zone the runtime knows, else "UTC" (a typo in the folder setting never breaks a page). */
export const validTimeZone = (zone: string | undefined): string => {
  if (!zone) return "UTC";
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone }).format(0);
    return zone;
  } catch {
    return "UTC";
  }
};

const instant = (iso: string | undefined): Date | undefined => {
  if (!iso) return undefined;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

/** The calendar day ("2027-06-08") an instant falls on in `zone`: the agenda's day tab. */
export const dayIn = (iso: string | undefined, zone: string): string | undefined => {
  const date = instant(iso);
  if (!date) return undefined;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: validTimeZone(zone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
};

/** The time of an instant in `zone`, the page's way ("9:30 AM" in en-US, "09:30" in fr). */
export const formatTime = (
  iso: string | undefined,
  language: string,
  zone: string,
): string | undefined => {
  const date = instant(iso);
  if (!date) return undefined;
  return new Intl.DateTimeFormat(language, {
    timeStyle: "short",
    timeZone: validTimeZone(zone),
  }).format(date);
};

/** An instant as an ISO string with its offset in `zone` ("2027-06-08T09:30:00+01:00"), for <time>. */
export const isoInZone = (iso: string | undefined, zone: string): string | undefined => {
  const date = instant(iso);
  if (!date) return undefined;
  const tz = validTimeZone(zone);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  const local = Date.UTC(
    Number(get("year")),
    Number(get("month")) - 1,
    Number(get("day")),
    Number(get("hour")),
    Number(get("minute")),
    Number(get("second")),
  );
  const offset = Math.round((local - date.getTime()) / 60_000);
  const sign = offset < 0 ? "-" : "+";
  const abs = Math.abs(offset);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  const day = `${get("year")}-${get("month")}-${get("day")}`;
  return `${day}T${get("hour")}:${get("minute")}:${get("second")}${sign}${hh}:${mm}`;
};

/** Text of an HTML string with its tags dropped, in one linear pass (no backtracking regex). */
const textOf = (html: string) => {
  let out = "";
  let inTag = false;
  for (const ch of html) {
    if (ch === "<" || ch === ">") {
      inTag = ch === "<";
      out += " ";
    } else if (!inTag) {
      out += ch;
    }
  }
  return out;
};

/** Reading time of a rich text in minutes (200 words a minute), at least 1. */
export const readingMinutes = (html: string | undefined): number => {
  const words = textOf(html ?? "")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

/**
 * The name a person is filed under: their sort name, else the last word of their full name. Used
 * to sort a speaker gallery and to build its A-Z index.
 */
export const sortNameOf = (name: string | undefined, sortName: string | undefined): string =>
  (sortName?.trim() || name?.trim().split(/\s+/).at(-1) || "").trim();

/** The A-Z index letter of a sort name: its first letter without accent, upper case; "#" otherwise. */
export const indexLetter = (sortName: string): string => {
  const first = sortName
    .normalize("NFD")
    .replaceAll(/\p{Diacritic}/gu, "")
    .charAt(0)
    .toUpperCase();
  return /^[A-Z]$/.test(first) ? first : "#";
};
