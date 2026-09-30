/**
 * A date for visitors, in the page's language ("30 September 2026", "30 septembre 2026").
 *
 * Formats the CALENDAR day the editor picked (the date part of the ISO string), in UTC. Parsing
 * the instant and formatting it in the server's time zone shows the day before on a UTC server
 * for a date picked at midnight in Paris ("2026-09-30T00:00:00+02:00"), while <time dateTime>
 * says the 30th. Falls back to the date part if the runtime cannot format it.
 */
export const formatDate = (iso: string | undefined, language: string): string | undefined => {
  if (!iso) return undefined;
  const day = iso.slice(0, 10);
  const date = new Date(`${day}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return day;
  try {
    return new Intl.DateTimeFormat(language, { dateStyle: "long", timeZone: "UTC" }).format(date);
  } catch {
    return day;
  }
};

/** The date part of an ISO string, for <time dateTime>. */
export const isoDay = (iso: string | undefined) => iso?.slice(0, 10);
