/**
 * Sorting and grouping of this module's lists, done in code because they depend on the page's
 * language (name order), on the event's time zone (agenda days) or on shared categories (related
 * stories). Pure functions over plain entries, unit-tested in select.test.ts.
 */
import { indexLetter } from "./format.js";

/** A person of a speaker gallery: identifier and the name they are filed under. */
export interface PersonEntry {
  id: string;
  sortName: string;
}

/** People in the page's language order of their sort names (accents and case ignored). */
export const sortPeople = <T extends PersonEntry>(people: T[], language: string): T[] => {
  const collator = new Intl.Collator(language, { sensitivity: "base" });
  return [...people].sort((a, b) => collator.compare(a.sortName, b.sortName));
};

/** The A-Z index: each letter in use, with the identifier of the first person filed under it. */
export const indexOf = (people: PersonEntry[]): { letter: string; id: string }[] => {
  const seen = new Map<string, string>();
  for (const person of people) {
    const letter = indexLetter(person.sortName);
    if (!seen.has(letter)) seen.set(letter, person.id);
  }
  return [...seen].map(([letter, id]) => ({ letter, id }));
};

/** A session of the agenda: its day in the event's zone, its start instant and its facets. */
export interface SessionEntry {
  id: string;
  day?: string;
  start?: string;
  stream?: string;
  room?: string;
  type?: string;
}

/** Sessions grouped by day (days in order, sessions by start time; undated sessions left out). */
export const groupByDay = <T extends SessionEntry>(
  sessions: T[],
): { day: string; sessions: T[] }[] => {
  const days = new Map<string, T[]>();
  for (const session of sessions) {
    if (!session.day || !session.start) continue;
    const list = days.get(session.day) ?? [];
    list.push(session);
    days.set(session.day, list);
  }
  return [...days.keys()]
    .sort((a, b) => a.localeCompare(b))
    .map((day) => ({
      day,
      sessions: (days.get(day) ?? []).sort(
        (a, b) => Date.parse(a.start ?? "") - Date.parse(b.start ?? ""),
      ),
    }));
};

/** The distinct values of a facet (stream, room, type) among sessions, in the page's language order. */
export const facetValues = (
  sessions: SessionEntry[],
  facet: "stream" | "room" | "type",
  language: string,
): string[] => {
  const collator = new Intl.Collator(language, { sensitivity: "base" });
  const values = new Set(
    sessions.map((session) => session[facet]).filter((v): v is string => Boolean(v)),
  );
  return [...values].sort((a, b) => collator.compare(a, b));
};

/** A story that may be related: identifier, categories, publication date. */
export interface StoryEntry {
  id: string;
  categories: string[];
  published?: string;
}

/**
 * Stories related to `story`: those sharing the most categories with it, newest first among
 * equals; the story itself and stories sharing nothing are left out.
 */
export const related = <T extends StoryEntry>(
  story: StoryEntry,
  candidates: T[],
  max: number,
): T[] => {
  const mine = new Set(story.categories);
  return candidates
    .filter((c) => c.id !== story.id)
    .map((c) => ({ c, shared: c.categories.filter((id) => mine.has(id)).length }))
    .filter(({ shared }) => shared > 0)
    .sort((a, b) => b.shared - a.shared || (b.c.published ?? "").localeCompare(a.c.published ?? ""))
    .slice(0, max)
    .map(({ c }) => c);
};
