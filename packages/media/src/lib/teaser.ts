/**
 * The opening paragraphs of a members-only body, shown above the members notice to a visitor who
 * is not signed in. Same as classic-templates src/lib/teaser.ts: keep both in step (the two
 * modules share no code).
 *
 * Only this part of the body is ever sent to such a visitor: the rest is cut here, on the server,
 * so it never reaches the browser (no hidden element, no blur over text that is still in the HTML).
 *
 * Paragraphs are the `<p>` elements of the body's flow: at the top, or inside plain wrappers
 * (`div`, `section`, `article`) only; a paragraph inside a list, a quote or a table is part of that
 * block, not one of the body's paragraphs. Whatever comes before the cut (a heading, a figure, a
 * list) comes with it. The cut always leaves at least one paragraph out: a body of two paragraphs
 * with a teaser of two shows one, so the teaser never gives the whole body away.
 *
 * One linear pass, no backtracking regex; wrappers still open at the cut are closed. The result is
 * still rich text from the repository: render it through RichText (sanitized there), never raw.
 */

/** Elements that never have content, so never a closing tag. */
const VOID = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);

/** Containers a paragraph of the body's flow may sit in. */
const WRAPPERS = new Set(["div", "section", "article"]);

/** Most paragraphs a teaser may show (the setting's upper bound). */
export const MAX_TEASER_PARAGRAPHS = 10;

/** Paragraphs shown when the item does not say. */
export const DEFAULT_TEASER_PARAGRAPHS = 2;

/** The item's setting as a number of paragraphs: 0 to 10, the default when absent or not a number. */
export const teaserParagraphs = (value: unknown): number => {
  const number = typeof value === "string" ? Number(value) : value;
  if (typeof number !== "number" || !Number.isFinite(number)) return DEFAULT_TEASER_PARAGRAPHS;
  return Math.min(MAX_TEASER_PARAGRAPHS, Math.max(0, Math.trunc(number)));
};

interface Tag {
  /** Index just after the tag's ">". */
  end: number;
  name: string;
  closing: boolean;
  selfClosing: boolean;
}

/** The tag starting at `start` (a "<"), or undefined when it is not one (text, comment, doctype). */
const readTag = (html: string, start: number): Tag | undefined => {
  let i = start + 1;
  const closing = html[i] === "/";
  if (closing) i += 1;
  const nameStart = i;
  while (i < html.length && /[a-zA-Z0-9]/.test(html[i] ?? "")) i += 1;
  if (i === nameStart || !/[a-zA-Z]/.test(html[nameStart] ?? "")) return undefined;
  const name = html.slice(nameStart, i).toLowerCase();
  let quote: string | undefined;
  for (; i < html.length; i += 1) {
    const ch = html[i];
    if (quote) {
      if (ch === quote) quote = undefined;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === ">") {
      return { end: i + 1, name, closing, selfClosing: html[i - 1] === "/" };
    }
  }
  return undefined;
};

interface Cut {
  /** Index in the HTML just after the paragraph (or where the next one starts). */
  at: number;
  /** Wrappers still open there, outermost first. */
  open: string[];
}

/** Pops the open <p> and records a cut after it when it is one of the body's paragraphs. */
const closeParagraph = (stack: string[], cuts: Cut[], at: number) => {
  stack.pop();
  if (stack.every((name) => WRAPPERS.has(name))) cuts.push({ at, open: [...stack] });
};

/** Updates the open-element stack (and the cuts) for one tag that starts at `start`. */
const onTag = (tag: Tag, start: number, stack: string[], cuts: Cut[]) => {
  if (VOID.has(tag.name) || tag.selfClosing) return;
  if (!tag.closing) {
    // A <p> inside an open <p> closes it first, as a browser reads it.
    if (tag.name === "p" && stack.at(-1) === "p") closeParagraph(stack, cuts, start);
    stack.push(tag.name);
    return;
  }
  const index = stack.lastIndexOf(tag.name);
  if (index === -1) return; // a closing tag with nothing to close
  if (tag.name === "p" && index === stack.length - 1) closeParagraph(stack, cuts, tag.end);
  else stack.length = index;
};

/** Every place the body's paragraphs end, in order. */
const paragraphCuts = (html: string): Cut[] => {
  const cuts: Cut[] = [];
  const stack: string[] = [];
  let i = html.indexOf("<");
  while (i !== -1) {
    if (html.startsWith("<!--", i)) {
      const close = html.indexOf("-->", i + 4);
      i = close === -1 ? -1 : html.indexOf("<", close + 3);
      continue;
    }
    const tag = readTag(html, i);
    if (tag) onTag(tag, i, stack, cuts);
    i = html.indexOf("<", tag ? tag.end : i + 1);
  }
  if (stack.at(-1) === "p") closeParagraph(stack, cuts, html.length);
  return cuts;
};

/**
 * The first `paragraphs` paragraphs of `html` (see the module comment), with everything before
 * them; "" when the body has fewer than two paragraphs or `paragraphs` is 0.
 */
export const teaserHtml = (html: string | undefined, paragraphs: number): string => {
  if (!html || paragraphs <= 0) return "";
  const cuts = paragraphCuts(html);
  const cut = cuts[Math.min(paragraphs, cuts.length - 1) - 1];
  if (!cut) return "";
  const closing = cut.open.toReversed().map((name) => `</${name}>`);
  return html.slice(0, cut.at) + closing.join("");
};
