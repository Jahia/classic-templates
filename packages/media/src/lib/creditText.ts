/**
 * The credit line of a picture or video of the media library (ctmdmix:credited, property
 * ctmdCredit). No JCR and no React here: unit-tested in creditText.test.ts.
 */

/** The property the ctmdmix:credited mixin adds to a file. */
export const CREDIT_PROPERTY = "ctmdCredit";

/** A credit longer than this is cut: a caption, not a paragraph. */
export const MAX_CREDIT_LENGTH = 200;

/**
 * The credit as it is shown: runs of white space (line breaks included) become one space, the ends
 * are trimmed and a very long value is cut at {@link MAX_CREDIT_LENGTH}. Undefined when nothing is
 * left, so the caller renders nothing at all.
 */
export const normalizeCredit = (raw: string | null | undefined): string | undefined => {
  const text = (raw ?? "").replaceAll(/\s+/g, " ").trim();
  if (!text) return undefined;
  return text.length > MAX_CREDIT_LENGTH ? text.slice(0, MAX_CREDIT_LENGTH).trimEnd() : text;
};
