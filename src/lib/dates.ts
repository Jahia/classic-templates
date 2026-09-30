/**
 * A date for visitors, in the page's language ("30 September 2026", "30 septembre 2026").
 * Accepts the ISO string Jahia returns for date properties; falls back to the date part of the
 * ISO string if the runtime cannot format it.
 */
export const formatDate = (iso: string | undefined, language: string): string | undefined => {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  try {
    return new Intl.DateTimeFormat(language, { dateStyle: "long" }).format(date);
  } catch {
    return iso.slice(0, 10);
  }
};

/** The date part of an ISO string, for <time dateTime>. */
export const isoDay = (iso: string | undefined) => iso?.slice(0, 10);
