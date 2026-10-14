/**
 * The keyboard model of the search box combobox, pure so it is unit tested. (The template set's
 * header box has the same model in its own lib/headerSearch.ts: the two bundles share no code.)
 */

/** What the keyboard asks of a combobox with a list of suggestions. */
export interface KeyInput {
  key: string;
  /** The list box is open. */
  open: boolean;
  /** The highlighted option, -1 for none. */
  active: number;
  /** How many options there are. */
  count: number;
  /** The key was pressed in the input (not on another control of the box). */
  fromInput: boolean;
  /** A panel holding the box is open (small screens). */
  expanded?: boolean;
}

/** The effect of a key: what to change, whether to cancel the browser's own handling, what to do. */
export interface KeyResult {
  /** Cancel the key's default (arrow keys scroll, Enter submits the form). */
  prevent: boolean;
  open?: boolean;
  active?: number;
  /** Go to the option at this index (the highlighted one, on Enter). */
  pick?: number;
  /** Close the panel and give the focus back to its button. */
  collapse?: boolean;
}

const NOTHING: KeyResult = { prevent: false };

const escapeResult = ({ open, expanded }: KeyInput): KeyResult => {
  if (open) return { prevent: true, open: false, active: -1 };
  return expanded ? { prevent: true, collapse: true } : NOTHING;
};

const arrowResult = ({ key, open, active, count }: KeyInput): KeyResult => {
  if (count === 0) return NOTHING;
  if (!open) return { prevent: true, open: true };
  if (key === "ArrowDown") return { prevent: true, active: (active + 1) % count };
  return { prevent: true, active: active <= 0 ? count - 1 : active - 1 };
};

const enterResult = ({ open, active, count }: KeyInput): KeyResult => {
  if (open && active >= 0 && active < count) {
    return { prevent: true, open: false, active: -1, pick: active };
  }
  return { prevent: false, open: false, active: -1 };
};

/**
 * The keyboard model of the combobox (ARIA 1.2 pattern): ArrowDown and ArrowUp open the list, then
 * move the highlight (wrapping); Enter on a highlighted option goes to it, Enter with none lets the
 * form submit (the words go to the search page); Escape closes the list, then the panel.
 */
export const keyResult = (input: KeyInput): KeyResult => {
  if (input.key === "Escape") return escapeResult(input);
  if (!input.fromInput) return NOTHING;
  if (input.key === "ArrowDown" || input.key === "ArrowUp") return arrowResult(input);
  return input.key === "Enter" ? enterResult(input) : NOTHING;
};
