/**
 * The keyboard model of the search box and its suggestion links, pure so it is unit tested. (The
 * template set's header box has the same model in its own lib/headerSearch.ts: the two bundles
 * share no code.)
 */

/** What the keyboard asks of the search box and its list of suggestion links. */
export interface KeyInput {
  key: string;
  /** The list of suggestions is shown. */
  open: boolean;
  /** Where the focus is: the input (-1) or a suggestion link (its index). */
  focus: number;
  /** How many suggestion links there are. */
  count: number;
  /** A panel holding the box is open (small screens). */
  expanded?: boolean;
}

/** The effect of a key: what to change, whether to cancel the browser's own handling. */
export interface KeyResult {
  /** Cancel the key's default (arrow keys scroll the page). */
  prevent: boolean;
  open?: boolean;
  /** Move the focus: to the input (-1) or to the suggestion link at this index. */
  focus?: number;
  /** Close the panel and give the focus back to its button. */
  collapse?: boolean;
}

const NOTHING: KeyResult = { prevent: false };

const escapeResult = ({ open, focus, expanded }: KeyInput): KeyResult => {
  if (focus >= 0) return { prevent: true, open: false, focus: -1 };
  if (open) return { prevent: true, open: false };
  return expanded ? { prevent: true, collapse: true } : NOTHING;
};

const downResult = ({ open, focus, count }: KeyInput): KeyResult => {
  if (!open) return { prevent: true, open: true };
  return { prevent: true, focus: focus + 1 < count ? focus + 1 : 0 };
};

const upResult = ({ open, focus, count }: KeyInput): KeyResult => {
  if (!open) return { prevent: true, open: true };
  if (focus === -1) return { prevent: true, focus: count - 1 };
  return { prevent: true, focus: focus - 1 };
};

/**
 * The keyboard model of the search box. The suggestions are plain links: ArrowDown opens the list,
 * then moves the focus from the input onto the links and between them (wrapping); ArrowUp moves
 * back, from the first link to the input; Escape on a link returns to the input and closes the
 * list, Escape in the input closes the list, then the panel. Enter is the browser's: on a link it
 * follows it, in the input it submits the form (the words go to the search page).
 */
export const keyResult = (input: KeyInput): KeyResult => {
  if (input.key === "Escape") return escapeResult(input);
  if (input.count === 0) return NOTHING;
  if (input.key === "ArrowDown") return downResult(input);
  return input.key === "ArrowUp" ? upResult(input) : NOTHING;
};
