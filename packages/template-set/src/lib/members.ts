/**
 * Members-only gate: what a visitor gets of a flagged item or page.
 *
 * The flag is a presentation gate, not an access rule: it decides which view the visitor is shown,
 * it does not change what the repository will serve (docs/guides/members-only-content.md).
 */

/** "open": the real content. "teaser": what a visitor who is not signed in gets instead. */
export type Gate = "open" | "teaser";

/**
 * The gate for one visitor. Editors see the real content in Page Builder (edit mode) and in
 * preview, where they are signed in anyway; only a visitor who is not signed in is held back.
 */
export const gateFor = ({
  membersOnly,
  signedIn,
  editMode,
}: {
  membersOnly: boolean;
  signedIn: boolean;
  editMode: boolean;
}): Gate => (!membersOnly || signedIn || editMode ? "open" : "teaser");

/**
 * The nearest node, from `start` upwards, that `flagged` accepts, or undefined. `parent` steps to
 * the next node up (undefined at the top or when the next node is not a page); `visit` is called on
 * every node looked at, including the one found, so the caller can register a cache dependency on
 * each: un-flagging a parent page must refresh the pages below it.
 */
export const nearestFlagged = <T>(
  start: T,
  flagged: (node: T) => boolean,
  parent: (node: T) => T | undefined,
  visit?: (node: T) => void,
): T | undefined => {
  const seen = new Set<T>();
  let node: T | undefined = start;
  while (node !== undefined && !seen.has(node)) {
    seen.add(node);
    visit?.(node);
    if (flagged(node)) return node;
    node = parent(node);
  }
  return undefined;
};
