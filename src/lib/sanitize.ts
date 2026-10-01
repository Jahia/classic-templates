import { decodeHTMLAttribute } from "entities/decode";
import { FilterXSS, escapeHtml } from "xss";

/**
 * Allow-list sanitizer for rich text written by editors.
 *
 * The template set never relies on platform-side HTML filtering, a site setting it cannot count
 * on. Runs server-side, in linear time (js-xss is pure JavaScript, no DOM needed in GraalJS; its
 * tag parser is used, the attributes are read here in one pass).
 *
 * Kept: editorial markup (paragraphs, lists including definition lists, emphasis, headings, links,
 * images, figures, data tables with their caption and header associations, quotes, code), and the
 * `lang` / `dir` of any element (a phrase in another language, RGAA 8.7). Every other tag and
 * attribute is left out, and so is the content of the elements whose content is not text
 * (scripts, style sheets, frames, templates...). The theme owns the look, so there are no inline
 * styles or classes. Links open in the same window and carry no title (a new window must be
 * announced, RGAA 13.2; a title must repeat the link text, RGAA 6.1); images carry no title. Link
 * and image URLs keep only http(s), mailto, tel, relative paths, anchors, and Jahia's internal
 * link placeholders (##cms-context##, ##doc-context##), which the render chain rewrites after the
 * view. Attribute values are compared and written as the browser reads them (character references
 * decoded, then encoded again).
 *
 * Ids written by editors (on headings and table headers) are prefixed per block (`ctpl-rt-` by
 * default), and so are the anchors and table `headers` that point at them, so they never collide
 * with the page's own ids. An anchor to any other id (`#main-content`, a section of the page) is
 * kept as written.
 *
 * Headings: the page template owns the only h1, and a body's headings sit under the heading of
 * the section that shows it. They are renumbered from `headingLevel` down (an h1 or h2 written by
 * the editor becomes the first level, never above it) and never skip a level (h2 then h4 becomes
 * h3 then h4 under a section h2), so the page outline stays whole (RGAA 9.1).
 *
 * Tables: every table is wrapped in a scroll container (`ctpl-table-scroll`, `role="region"`,
 * `tabindex="0"`) so a wide table scrolls on its own at 320 px instead of widening the page (RGAA
 * 10.11), and keyboard users can scroll it (axe `scrollable-region-focusable`). The region is named
 * after the table's caption when it has one (the caption gets an id in the block's id space), else
 * with `tableLabel` (a translated "Table", numbered when the block has several tables).
 *
 * The output is balanced: every element is closed inside the block, and a closing tag with no
 * matching element is left out.
 */
const TEXT = ["lang", "dir"];
const ALLOWED: Record<string, string[]> = Object.fromEntries(
  Object.entries({
    p: [],
    br: [],
    hr: [],
    div: [],
    span: [],
    strong: [],
    b: [],
    em: [],
    i: [],
    u: [],
    s: [],
    sub: [],
    sup: [],
    small: [],
    mark: [],
    h1: ["id"],
    h2: ["id"],
    h3: ["id"],
    h4: ["id"],
    h5: ["id"],
    h6: ["id"],
    ul: [],
    ol: ["start", "reversed"],
    li: [],
    dl: [],
    dt: [],
    dd: [],
    blockquote: ["cite"],
    q: ["cite"],
    cite: [],
    abbr: ["title"],
    a: ["href", "hreflang"],
    img: ["src", "alt", "width", "height"],
    figure: [],
    figcaption: [],
    table: ["role"],
    caption: [],
    thead: [],
    tbody: [],
    tfoot: [],
    tr: [],
    th: ["scope", "colspan", "rowspan", "id", "headers"],
    td: ["colspan", "rowspan", "headers"],
    code: [],
    pre: [],
    kbd: [],
  }).map(([tag, attrs]) => [tag, [...attrs, ...TEXT]]),
);

const VOID = new Set(["br", "hr", "img"]);

/** Elements left out together with their content. */
const WITH_CONTENT = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "noscript",
  "noembed",
  "noframes",
  "template",
  "title",
  "textarea",
  "select",
  "xmp",
  "plaintext",
  "svg",
  "math",
]);

/** Elements of another namespace, closed by a self-closing tag (`<svg/>`). */
const FOREIGN = new Set(["svg", "math"]);

const SAFE_URL =
  /^(?:https?:\/\/|mailto:|tel:|\/(?![/\\])|#|\.{1,2}\/|##(?:cms|doc)-context##\/(?!\/))/i;
const SAFE_RELATIVE = /^(?!\/\/)[\w\-./?=&%~+#]+$/; // "page.html", "files/x.pdf#p2": no scheme
const LANG = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i; // BCP 47, loosely: "en", "fr-CA", "zh-Hant"
const ID = /^[a-z][\w-]{0,63}$/i;
const PREFIX = /^[a-z][\w-]{0,40}$/i;
const NUMBER = /^\d{1,4}$/;
const SCOPE = new Set(["row", "col", "rowgroup", "colgroup"]);
const DIR = new Set(["ltr", "rtl", "auto"]);
const DEFAULT_PREFIX = "ctpl-rt-";

/** True for a control character (removed or trimmed by the URL parser) or a "\\" (read as "/"). */
const hasIgnoredCharacter = (url: string): boolean => {
  for (let i = 0; i < url.length; i++) {
    const code = url.codePointAt(i) ?? 0; // always defined: i < url.length
    if (code < 0x20 || code === 0x7f || code === 0x5c) return true;
  }
  return false;
};

/** True when a link or image URL, as the browser reads it, is allowed (see the module comment). */
export const isSafeRichTextUrl = (value: string): boolean => {
  const url = value.trim();
  if (!url || hasIgnoredCharacter(url)) return false;
  return SAFE_URL.test(url) || (SAFE_RELATIVE.test(url) && !url.includes(":"));
};

const encodeAttr = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const isSpace = (c: string) => c === " " || c === "\n" || c === "\t" || c === "\r" || c === "\f";

/** Position of the first character at or after `from` that is not a space (at most `end`). */
const skipSpaces = (source: string, from: number, end: number): number => {
  let j = from;
  while (j < end && isSpace(source[j])) j++;
  return j;
};

/** Position just after the attribute name starting at `from` (a leading "=" belongs to it). */
const endOfName = (source: string, from: number, end: number): number => {
  let j = from;
  if (source[j] === "=") j++;
  while (j < end && !isSpace(source[j]) && source[j] !== "/" && source[j] !== "=") j++;
  return j;
};

/** The value written after an "=" (quoted or not) from `from`, and the position just after it. */
const readValue = (source: string, from: number, end: number): [string, number] => {
  const j = skipSpaces(source, from, end);
  const quote = source[j];
  if (quote === '"' || quote === "'") {
    const close = source.indexOf(quote, j + 1);
    const stop = close === -1 || close > end ? end : close;
    return [source.slice(j + 1, stop), stop + 1];
  }
  let k = j;
  while (k < end && !isSpace(source[k])) k++;
  return [source.slice(j, k), k];
};

/**
 * The attributes of a start tag (`<a href="x" title=y>`), in one pass, as the browser reads them:
 * names in lower case, the first of two attributes with the same name, values decoded.
 */
const readAttributes = (source: string, from: number, end: number): Array<[string, string]> => {
  const attrs: Array<[string, string]> = [];
  const seen = new Set<string>();
  let j = from;
  while (j < end) {
    while (j < end && (isSpace(source[j]) || source[j] === "/")) j++;
    if (j >= end) break;
    const nameStart = j;
    j = endOfName(source, j, end);
    const name = source.slice(nameStart, j).toLowerCase();
    j = skipSpaces(source, j, end);
    let value = "";
    if (source[j] === "=") [value, j] = readValue(source, j + 1, end);
    if (name && !seen.has(name)) {
      seen.add(name);
      attrs.push([name, decodeHTMLAttribute(value)]);
    }
  }
  return attrs;
};

/** ` name="value"` as written in the output when `keep` is true, otherwise "". */
const writeIf = (keep: boolean, name: string, value: string): string =>
  keep ? ` ${name}="${encodeAttr(value)}"` : "";

/** The attribute as written in the output, or "" when it is left out. */
const writeAttribute = (tag: string, name: string, raw: string, prefix: string): string => {
  const value = raw.trim();
  switch (name) {
    case "href":
    case "src":
    case "cite":
      // An empty href would still link to the page itself.
      return writeIf(isSafeRichTextUrl(value), name, value);
    case "alt":
    case "title":
      // Always written out, an empty alt included.
      return writeIf(true, name, raw);
    case "lang":
    case "hreflang":
      return writeIf(LANG.test(value), name, value);
    case "dir":
      return writeIf(DIR.has(value), name, value);
    case "id":
      return writeIf(ID.test(value), name, `${prefix}${value}`);
    case "headers": {
      const ids = value.split(/\s+/).filter((id) => ID.test(id));
      return writeIf(ids.length > 0, name, ids.map((id) => `${prefix}${id}`).join(" "));
    }
    case "role":
      return writeIf(tag === "table" && value === "presentation", name, value);
    case "scope":
      return writeIf(SCOPE.has(value), name, value);
    case "reversed":
      return ' reversed=""';
    default: // start, width, height, colspan, rowspan
      return writeIf(NUMBER.test(value), name, value);
  }
};

/** State of one call of the filter (the library calls the hooks synchronously, in document order). */
type Pass = {
  prefix: string;
  /** Output ranges left out with their content, as [start, end) positions. */
  ranges: Array<[number, number]>;
  dropping: string | null;
  dropStart: number;
  dropDepth: number;
};

let pass: Pass = { prefix: DEFAULT_PREFIX, ranges: [], dropping: null, dropStart: 0, dropDepth: 0 };

const filter = new FilterXSS({
  whiteList: ALLOWED,
  allowCommentTag: false,
  css: false,
  onTag(tag, source, info) {
    if (!info.isWhite) return undefined;
    if (info.isClosing) return `</${tag}>`;
    // A tag cut by the end of the text is left out, as the browser does.
    if (!source.endsWith(">")) return "";
    let nameEnd = 1;
    while (nameEnd < source.length && !isSpace(source[nameEnd]) && source[nameEnd] !== ">")
      nameEnd++;
    const allowed = ALLOWED[tag];
    let attrs = "";
    for (const [name, value] of readAttributes(source, nameEnd, source.length - 1)) {
      if (allowed.includes(name)) attrs += writeAttribute(tag, name, value, pass.prefix);
    }
    return `<${tag}${attrs}>`;
  },
  onIgnoreTag(tag, source, info) {
    const state = pass;
    if (state.dropping) {
      if (tag === state.dropping) {
        if (info.isClosing) state.dropDepth--;
        else if (!(FOREIGN.has(tag) && source.endsWith("/>"))) state.dropDepth++;
        if (state.dropDepth === 0) {
          state.ranges.push([state.dropStart, info.position ?? 0]);
          state.dropping = null;
        }
      }
      return "";
    }
    // "<" before anything but a letter, "/", "!" or "?" is text, as the browser reads it.
    if (!/^<[a-z/!?]/i.test(source)) return escapeHtml(source);
    if (!info.isClosing && WITH_CONTENT.has(tag) && !(FOREIGN.has(tag) && source.endsWith("/>"))) {
      state.dropping = tag;
      state.dropStart = info.position ?? 0;
      state.dropDepth = 1;
    }
    return "";
  },
});

const filterTags = (html: string, prefix: string): string => {
  pass = { prefix, ranges: [], dropping: null, dropStart: 0, dropDepth: 0 };
  const out = filter.process(html);
  const { ranges, dropping, dropStart } = pass;
  // An element left out with its content and never closed runs to the end of the text.
  if (dropping) ranges.push([dropStart, out.length]);
  if (ranges.length === 0) return out;
  let kept = "";
  let at = 0;
  for (const [start, end] of ranges) {
    kept += out.slice(at, start);
    at = end;
  }
  return kept + out.slice(at);
};

/** A tag of the filter's own output. The lookahead keeps the name from giving characters back to
 * the attributes, so a `<` with no closing `>` fails in linear time. Exported for the tests. */
export const TAG = /<(\/?)([a-z][a-z0-9]*)(?![a-z0-9])([^<>]*)>/g;
const HEADING = /^h[1-6]$/;
const clamp = (level: number) => Math.min(Math.max(level, 2), 6);

/** An open element: its name, the name written (headings are renumbered), what closes it. */
type Open = { name: string; written: string; after?: string };

/** The elements open in the second pass, and the level of the last heading written. */
type Outline = {
  stack: Open[];
  counts: Map<string, number>;
  headingsOpen: number;
  previous: number;
};

const ascending = (a: number, b: number) => a - b;

/** The heading levels used in the filtered HTML, the ids of its elements, its number of tables. */
const scanTags = (html: string): { levels: Set<number>; ids: Set<string>; tables: number } => {
  const levels = new Set<number>();
  const ids = new Set<string>();
  let tables = 0;
  for (const match of html.matchAll(TAG)) {
    if (match[1]) continue;
    if (HEADING.test(match[2])) levels.add(Number(match[2][1]));
    if (match[2] === "table") tables++;
    const id = / id="([^"]*)"/.exec(match[3]);
    if (id) ids.add(id[1]);
  }
  return { levels, ids, tables };
};

/** A caption right at `from` (only white space before it): the table's first child. */
const CAPTION_NEXT = /\s*<caption(?![a-z0-9])/y;

const startsWithCaption = (html: string, from: number): boolean => {
  CAPTION_NEXT.lastIndex = from;
  return CAPTION_NEXT.test(html);
};

/** Name of the nth table of a block (1-based) that has no caption, out of `total` tables. */
export type TableLabel = (index: number, total: number) => string;

const defaultTableLabel: TableLabel = (index, total) => (total > 1 ? `Table ${index}` : "Table");

/** State of the tables of one block in the second pass. */
type Tables = {
  label: TableLabel;
  total: number;
  count: number;
  /** Id to give the caption that comes next, when its table is named after it. */
  captionId?: string;
  withoutCaption: boolean;
};

/**
 * The scroll container written before a table: a focusable region named after the table's caption
 * (an id in the block's id space: editor ids start with a letter, so `<prefix>-caption-<n>` is
 * never one of them), or with the block's table label.
 */
const openTableScroll = (tables: Tables, html: string, at: number, prefix: string): string => {
  tables.count++;
  let name: string;
  if (startsWithCaption(html, at)) {
    tables.captionId = `${prefix}-caption-${tables.count}`;
    name = ` aria-labelledby="${tables.captionId}"`;
  } else {
    tables.withoutCaption = true;
    name = ` aria-label="${encodeAttr(tables.label(tables.count, tables.total))}"`;
  }
  return `<div class="ctpl-table-scroll" role="region" tabindex="0"${name}>`;
};

/** Closes the last open element. */
const closeLast = (outline: Outline): string => {
  const open = outline.stack.pop() as Open;
  outline.counts.set(open.name, (outline.counts.get(open.name) ?? 1) - 1);
  if (HEADING.test(open.name)) outline.headingsOpen--;
  return `</${open.written}>${open.after ?? ""}`;
};

/** Closes the open elements down to and including the last one matching `test`. */
const closeTo = (outline: Outline, test: (name: string) => boolean): string => {
  let closed = "";
  for (;;) {
    const name = (outline.stack.at(-1) as Open).name;
    closed += closeLast(outline);
    if (test(name)) return closed;
  }
};

/** A closing tag: closes its element and the ones still open inside it, or "" when none is open. */
const closeTag = (outline: Outline, name: string): string => {
  if (name === "br") return "<br>"; // read as a line break by the browser
  if (HEADING.test(name)) {
    return outline.headingsOpen > 0 ? closeTo(outline, (n) => HEADING.test(n)) : "";
  }
  return (outline.counts.get(name) ?? 0) > 0 ? closeTo(outline, (n) => n === name) : "";
};

/**
 * The attributes of a start tag: a repeated id left out (the first element with an id keeps it,
 * as the browser's anchors do), an anchor to one of the block's own ids prefixed.
 */
const rewriteAttributes = (
  name: string,
  written: string,
  { ids, seenIds, prefix }: { ids: Set<string>; seenIds: Set<string>; prefix: string },
): string => {
  let attrs = written;
  const id = / id="([^"]*)"/.exec(attrs);
  if (id) {
    if (seenIds.has(id[1])) attrs = attrs.replace(id[0], "");
    else seenIds.add(id[1]);
  }
  if (name === "a") {
    attrs = attrs.replace(/ href="#([^"]*)"/, (match, target: string) =>
      ids.has(`${prefix}${target}`) ? ` href="#${prefix}${target}"` : match,
    );
  }
  return attrs;
};

/** Opens an element that is not void: a heading gets its level in the block's outline. */
const openElement = (
  outline: Outline,
  name: string,
  attrs: string,
  level: (written: number) => number,
  after?: string,
): string => {
  let out = "";
  let written = name;
  if (HEADING.test(name)) {
    // A heading inside a heading closes it, as the browser does.
    if (outline.headingsOpen > 0) out += closeTo(outline, (n) => HEADING.test(n));
    outline.previous = Math.min(level(Number(name[1])), outline.previous + 1);
    written = `h${outline.previous}`;
    outline.headingsOpen++;
  }
  outline.stack.push({ name, written, after });
  outline.counts.set(name, (outline.counts.get(name) ?? 0) + 1);
  return `${out}<${written}${attrs}>`;
};

/** What the second pass reports besides the HTML. */
export interface SanitizeReport {
  html: string;
  /** An image had no text alternative (it got alt=""). */
  imageWithoutAlt: boolean;
  /** A table had no caption (its region is named with the table label). */
  tableWithoutCaption: boolean;
}

/** The written start tag of an element that is not a table, the table's scroll region included. */
const startTag = (
  context: { outline: Outline; tables: Tables; prefix: string; level: (written: number) => number },
  name: string,
  attrs: string,
  position: { html: string; at: number },
): string => {
  const { outline, tables, prefix, level } = context;
  if (name === "table") {
    const scroll = openTableScroll(tables, position.html, position.at, prefix);
    return scroll + openElement(outline, name, attrs, level, "</div>");
  }
  if (name === "caption" && tables.captionId) {
    const id = tables.captionId;
    tables.captionId = undefined;
    return openElement(outline, name, ` id="${id}"${attrs}`, level);
  }
  return openElement(outline, name, attrs, level);
};

/**
 * Second pass over the filtered HTML, where every tag is in canonical form: closes the elements in
 * the block, renumbers the headings (the editor's levels are ranked: the highest used becomes
 * `base`, the next `base + 1`..., and each heading is at most one level below the previous one),
 * prefixes the anchors to the block's own ids, gives an image without a text alternative an empty
 * one, and wraps each table in its scroll region.
 */
const finish = (
  html: string,
  base: number,
  prefix: string,
  tableLabel: TableLabel,
): SanitizeReport => {
  const { levels, ids, tables: total } = scanTags(html);
  const rank = new Map(
    [...levels].sort(ascending).map((level, index) => [level, clamp(base + index)]),
  );
  const level = (written: number) => rank.get(written) ?? clamp(base);
  const outline: Outline = {
    stack: [],
    counts: new Map(),
    headingsOpen: 0,
    previous: clamp(base) - 1,
  };
  const attributes = { ids, seenIds: new Set<string>(), prefix };
  const tables: Tables = { label: tableLabel, total, count: 0, withoutCaption: false };
  const context = { outline, tables, prefix, level };
  let imageWithoutAlt = false;
  let out = "";
  let at = 0;

  for (const match of html.matchAll(TAG)) {
    out += html.slice(at, match.index);
    at = match.index + match[0].length;
    const [, closing, name] = match;
    if (closing) {
      out += closeTag(outline, name);
      continue;
    }
    let attrs = rewriteAttributes(name, match[3], attributes);
    if (name === "img" && !attrs.includes(' alt="')) {
      attrs = ` alt=""${attrs}`;
      imageWithoutAlt = true;
    }
    out += VOID.has(name) ? `<${name}${attrs}>` : startTag(context, name, attrs, { html, at });
  }
  out += html.slice(at);
  while (outline.stack.length) out += closeLast(outline);
  return { html: out, imageWithoutAlt, tableWithoutCaption: tables.withoutCaption };
};

export interface SanitizeOptions {
  /** Level of the body's first-rank headings: one below the heading that introduces the text. */
  headingLevel?: number;
  /** Prefix of the editor's ids and of the anchors pointing at them, unique per block on a page. */
  idPrefix?: string;
  /** Name of a table without caption (translated by the caller); "Table", "Table 2"... by default. */
  tableLabel?: TableLabel;
}

/**
 * Sanitized HTML of an editor's rich text (see the module comment), whether an image had no text
 * alternative (it gets alt="": a missing alt fails RGAA 1.1 outright; an empty one at least keeps
 * screen readers from reading the file name) and whether a table had no caption. Edit mode tells
 * the editor about both.
 */
export const sanitizeRichTextWithReport = (
  html: string,
  {
    headingLevel = 2,
    idPrefix = DEFAULT_PREFIX,
    tableLabel = defaultTableLabel,
  }: SanitizeOptions = {},
): SanitizeReport => {
  if (!html) return { html: "", imageWithoutAlt: false, tableWithoutCaption: false };
  const prefix = PREFIX.test(idPrefix) ? idPrefix : DEFAULT_PREFIX;
  return finish(filterTags(html, prefix), headingLevel, prefix, tableLabel);
};

/** Sanitized HTML of an editor's rich text (see sanitizeRichTextWithReport). */
export const sanitizeRichText = (html: string, options: SanitizeOptions = {}): string =>
  sanitizeRichTextWithReport(html, options).html;
