import { FilterXSS, escapeAttrValue } from "xss";

/**
 * Allow-list sanitizer for rich text written by editors.
 *
 * The template set never relies on platform-side HTML filtering, a site setting it cannot count
 * on.
 * Runs server-side (js-xss is pure JavaScript, no DOM needed in GraalJS).
 *
 * Kept: editorial markup (paragraphs, lists including definition lists, emphasis, headings, links,
 * images, figures, data tables with their caption and header associations, quotes, code), and the
 * `lang` / `dir` of any element (a phrase in another language, RGAA 8.7). Dropped: scripts and
 * styles with their content, event handlers, inline styles and classes (the theme owns the look),
 * iframes, forms, link targets and titles (a new window must be announced, RGAA 13.2; a title must
 * repeat the link text, RGAA 6.1), image titles. Link and image URLs keep only http(s), mailto,
 * tel, relative paths, anchors, and Jahia's internal link placeholders (##cms-context##,
 * ##doc-context##), which the render chain rewrites after the view.
 *
 * Ids written by editors are prefixed (`ctpl-rt-`), with the anchors and table `headers` that
 * point at them, so they never collide with the page's own ids.
 *
 * Headings: the page template owns the only h1, and a body's headings sit under the heading of
 * the section that shows it. They are renumbered from `headingLevel` down (an h1 or h2 written by
 * the editor becomes the first level, never above it) and never skip a level (h2 then h4 becomes
 * h3 then h4 under a section h2), so the page outline stays whole (RGAA 9.1).
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

const SAFE_URL = /^(?:https?:\/\/|mailto:|tel:|\/(?!\/)|#|\.{1,2}\/|##(?:cms|doc)-context##)/i;
const SAFE_RELATIVE = /^(?!\/\/)[\w\-./?=&%~+]+$/; // "page.html", "files/x.pdf": no scheme, not "//host"
const LANG = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i; // BCP 47, loosely: "en", "fr-CA", "zh-Hant"
const ID = /^[a-z][\w-]{0,63}$/i;
const PREFIX = /^[a-z][\w-]{0,40}$/i;

/** True when a link or image URL is allowed (see the module comment). */
export const isSafeRichTextUrl = (value: string): boolean => {
  const url = value.trim();
  return SAFE_URL.test(url) || (SAFE_RELATIVE.test(url) && !url.includes(":"));
};

const attr = (name: string, value: string) => `${name}="${escapeAttrValue(value)}"`;

/** One filter per id prefix (each rich-text block has its own, so two blocks never share an id). */
const filters = new Map<string, FilterXSS>();

const filterFor = (prefix: string): FilterXSS => {
  const cached = filters.get(prefix);
  if (cached) return cached;
  /** An editor id, prefixed; undefined when it is not a plain identifier. */
  const prefixed = (id: string) => (ID.test(id) ? `${prefix}${id}` : undefined);
  const filter = new FilterXSS({
    whiteList: ALLOWED,
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script", "style", "iframe", "object", "embed", "noscript", "template"],
    allowCommentTag: false,
    onTagAttr(tag, name, value, isWhiteAttr) {
      // Called for every attribute, allowed or not: only allowed ones get past this line. A string
      // is used as the attribute as is, "" drops it, undefined keeps it through js-xss escaping. Never
      // echo the raw value: it has not been escaped.
      if (!isWhiteAttr) return "";
      if (name === "href" || name === "src" || name === "cite") {
        if (!isSafeRichTextUrl(value)) return ""; // an empty href would still link to this page
        const anchor = name === "href" && value.startsWith("#") ? prefixed(value.slice(1)) : null;
        if (anchor) return attr("href", `#${anchor}`);
        // Written out here: js-xss's own URL check would reject plain relative paths ("page.html").
        return attr(name, value.trim());
      }
      // Always written out: js-xss prints an empty value as a bare `alt`, valid but easy to misread.
      if (name === "alt") return attr("alt", value);
      if (name === "lang" || name === "hreflang") return LANG.test(value) ? attr(name, value) : "";
      if (name === "dir") return ["ltr", "rtl", "auto"].includes(value) ? attr("dir", value) : "";
      if (name === "id") {
        const id = prefixed(value);
        return id ? attr("id", id) : "";
      }
      if (name === "headers") {
        const ids = value.split(/\s+/).map(prefixed).filter(Boolean);
        return ids.length > 0 ? attr("headers", ids.join(" ")) : "";
      }
      if (name === "role")
        return tag === "table" && value === "presentation" ? attr("role", value) : "";
      return undefined;
    },
  });
  if (filters.size < 64) filters.set(prefix, filter);
  return filter;
};

const clamp = (level: number) => Math.min(Math.max(level, 2), 6);

/**
 * Renumbers the headings of sanitized HTML: the editor's levels are ranked (the highest used
 * becomes `base`, the next `base + 1`...), then each heading is at most one level below the
 * previous one. Runs on the sanitizer's own output, so the tag pattern is simple and linear.
 */
const renumberHeadings = (html: string, base: number): string => {
  const used = [...new Set([...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1])))].sort();
  if (used.length === 0) return html;
  const rank = new Map(used.map((level, index) => [level, clamp(base + index)]));
  let previous = clamp(base) - 1;
  let open = 0;
  return html.replace(
    /<(\/?)h([1-6])([\s>])/g,
    (_match, closing: string, level: string, next: string) => {
      if (closing) return `</h${open}${next}`;
      open = Math.min(rank.get(Number(level)) ?? clamp(base), previous + 1);
      previous = open;
      return `<h${open}${next}`;
    },
  );
};

export interface SanitizeOptions {
  /** Level of the body's first-rank headings: one below the heading that introduces the text. */
  headingLevel?: number;
  /** Prefix of the editor's ids and of the anchors pointing at them, unique per block on a page. */
  idPrefix?: string;
}

const IMG_WITHOUT_ALT = /<img\b(?![^>]*\balt=")/gi;

/**
 * Sanitized HTML of an editor's rich text (see the module comment), and whether an image had no
 * text alternative: it gets alt="" (a missing alt fails RGAA 1.1 outright; an empty one at least
 * keeps screen readers from reading the file name), and edit mode tells the editor.
 */
export const sanitizeRichTextWithReport = (
  html: string,
  { headingLevel = 2, idPrefix = "ctpl-rt-" }: SanitizeOptions = {},
): { html: string; imageWithoutAlt: boolean } => {
  const prefix = PREFIX.test(idPrefix) ? idPrefix : "ctpl-rt-";
  const clean = renumberHeadings(filterFor(prefix).process(html), headingLevel);
  const imageWithoutAlt = IMG_WITHOUT_ALT.test(clean);
  IMG_WITHOUT_ALT.lastIndex = 0;
  return { html: clean.replace(IMG_WITHOUT_ALT, '<img alt=""'), imageWithoutAlt };
};

/** Sanitized HTML of an editor's rich text (see sanitizeRichTextWithReport). */
export const sanitizeRichText = (html: string, options: SanitizeOptions = {}): string =>
  sanitizeRichTextWithReport(html, options).html;
