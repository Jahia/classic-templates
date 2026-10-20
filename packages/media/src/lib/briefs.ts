/**
 * Briefs and submissions of the supplier portal: the allowed values of their choice lists and the
 * pure rules the lists apply (open or closed, deadline order, newest first, status mapping, count
 * limit). No JCR and no React here: unit-tested in briefs.test.ts.
 */
import { isoDay } from "./format.js";

/** The statuses of a brief (ctmd:brief briefStatus). */
export const BRIEF_STATUSES = ["open", "closed"] as const;
export type BriefStatus = (typeof BRIEF_STATUSES)[number];

/** What a brief asks for (ctmd:brief mediaWanted), in the order labels are shown. */
export const MEDIA_WANTED = ["photo", "video"] as const;
export type MediaWanted = (typeof MEDIA_WANTED)[number];

/** What the media of a brief will be used for (ctmd:brief usage), in the order labels are shown. */
export const USAGES = ["storyIllustration", "social", "eventScreens"] as const;
export type Usage = (typeof USAGES)[number];

/** The licence a supplier grants on a submission (ctmd:submission licence). */
export const LICENCES = ["editorial", "exclusive30"] as const;
export type Licence = (typeof LICENCES)[number];

/** The statuses of a submission (ctmd:submission submissionStatus), in the order of its life. */
export const SUBMISSION_STATUSES = ["submitted", "inReview", "accepted", "declined"] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const isSubmissionStatus = (value: unknown): value is SubmissionStatus =>
  typeof value === "string" && (SUBMISSION_STATUSES as readonly string[]).includes(value);

/**
 * The values of a multi-valued choice list that the module knows, once each, in the order of the
 * allow-list: a value stored by an older definition or typed by a script never reaches a label key.
 */
export const knownValues = <T extends string>(
  values: readonly string[] | undefined,
  allowed: readonly T[],
): T[] => allowed.filter((value) => values?.includes(value));

/** A single choice kept only when the module knows it. */
export const knownValue = <T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): T | undefined => allowed.find((candidate) => candidate === value);

/** The status of a brief: anything but "closed" (including a missing value) is open. */
export const briefStatusOf = (value: string | undefined): BriefStatus =>
  value === "closed" ? "closed" : "open";

/** The status of a submission: a value the module does not know counts as just submitted. */
export const submissionStatusOf = (value: string | undefined): SubmissionStatus =>
  isSubmissionStatus(value) ? value : "submitted";

/**
 * A mark that says the status without colour, drawn beside the status text (never instead of it):
 * an empty circle, a half circle, a tick, a cross. Hidden from screen readers, which read the text.
 */
export const STATUS_CUE: Record<SubmissionStatus, string> = {
  submitted: "○",
  inReview: "◐",
  accepted: "✓",
  declined: "✕",
};

/** The fields of a brief the list rules read. */
export interface BriefRow {
  /** The deadline as an ISO date string. */
  deadline?: string;
  status?: string;
  title?: string;
}

/** Briefs to show: all of them with `showClosed`, else only the open ones. */
export const filterBriefs = <T extends BriefRow>(rows: readonly T[], showClosed: boolean): T[] =>
  showClosed ? [...rows] : rows.filter((row) => briefStatusOf(row.status) === "open");

/**
 * Briefs by deadline, the nearest first; a brief without a deadline goes last. Equal deadlines are
 * ordered by title in the page language.
 */
export const sortBriefs = <T extends BriefRow>(rows: readonly T[], language = "en"): T[] => {
  const collator = new Intl.Collator(language, { sensitivity: "base" });
  return [...rows].sort((a, b) => {
    const dayA = isoDay(a.deadline);
    const dayB = isoDay(b.deadline);
    if (dayA && dayB && dayA !== dayB) return dayA < dayB ? -1 : 1;
    if (dayA && !dayB) return -1;
    if (!dayA && dayB) return 1;
    return collator.compare(a.title ?? "", b.title ?? "");
  });
};

/** The fields of a submission the list rules read. */
export interface SubmissionRow {
  /** jcr:created as an ISO date-time string. */
  created?: string;
}

const timeOf = (iso: string | undefined): number => {
  const time = Date.parse(iso ?? "");
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
};

/** Submissions newest first; one without a creation date goes last (the input order is kept). */
export const sortSubmissions = <T extends SubmissionRow>(rows: readonly T[]): T[] =>
  [...rows].sort((a, b) => {
    const timeA = timeOf(a.created);
    const timeB = timeOf(b.created);
    if (timeA === timeB) return 0;
    return timeA > timeB ? -1 : 1;
  });

/**
 * How many items a list shows: the editor's number rounded and held between 1 and `max`, else
 * `fallback` when there is no usable number.
 */
export const listLimit = (value: number | undefined, fallback: number, max: number): number =>
  Math.min(Math.max(Math.round(value ?? fallback) || fallback, 1), max);

/** Thumbnails a submission card shows at most; the others are counted. */
export const MAX_THUMBNAILS = 4;
