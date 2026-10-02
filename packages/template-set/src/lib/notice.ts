/** Items a notice bar shows when the editor sets nothing, and the range it accepts. */
export const NOTICE_DEFAULT_ITEMS = 3;
const NOTICE_MAX_ITEMS = 10;

/**
 * Number of items a notice bar lists: the editor's value rounded and kept within 1-10 (the CND
 * constraint), 3 when it is missing or not a number. The view applies it again because a value
 * written over GraphQL or an import is not always checked against the constraint.
 */
export const noticeItemCount = (value: unknown): number => {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n === 0) return NOTICE_DEFAULT_ITEMS;
  return Math.min(Math.max(n, 1), NOTICE_MAX_ITEMS);
};

/**
 * A short, stable signature of the items a notice bar shows (their identifiers, in order). The
 * dismiss script keeps it in the visitor's session: a bar hidden by the visitor shows again as
 * soon as its items change, so a new notice is never missed. Only a change marker, not a
 * protection of any kind (32-bit FNV-1a, base 36).
 */
export const noticeSignature = (ids: string[]): string => {
  let hash = 2_166_136_261; // FNV offset basis
  for (const char of ids.join(",")) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16_777_619) >>> 0; // FNV prime
  }
  return hash.toString(36);
};
