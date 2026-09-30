import { FilterXSS, escapeAttrValue } from "xss";

/**
 * Allow-list sanitizer for rich text written by editors.
 *
 * The template set never relies on platform-side HTML filtering, a site setting it cannot count
 * on.
 * Runs server-side (js-xss is pure JavaScript, no DOM needed in GraalJS).
 *
 * Kept: editorial markup (paragraphs, lists, emphasis, headings h2-h6, links, images, figures,
 * tables, quotes, code). Dropped: scripts and styles with their content, event handlers, inline
 * styles and classes (the theme owns the look), iframes, forms. Link and image URLs keep only
 * http(s), mailto, tel, relative paths, anchors, and Jahia's internal link placeholders
 * (##cms-context##, ##doc-context##), which the render chain rewrites after the view.
 * An h1 becomes a bare h2: the page template owns the page's only h1.
 */
const ALLOWED: Record<string, string[]> = {
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
  h2: ["id"],
  h3: ["id"],
  h4: ["id"],
  h5: ["id"],
  h6: ["id"],
  ul: [],
  ol: ["start", "reversed"],
  li: [],
  blockquote: ["cite"],
  q: ["cite"],
  cite: [],
  abbr: ["title"],
  a: ["href", "title", "target", "rel", "hreflang"],
  img: ["src", "alt", "title", "width", "height"],
  figure: [],
  figcaption: [],
  table: [],
  caption: [],
  thead: [],
  tbody: [],
  tfoot: [],
  tr: [],
  th: ["scope", "colspan", "rowspan"],
  td: ["colspan", "rowspan"],
  code: [],
  pre: [],
  kbd: [],
};

const SAFE_URL = /^(?:https?:\/\/|mailto:|tel:|\/(?!\/)|#|\.{1,2}\/|##(?:cms|doc)-context##)/i;
const SAFE_RELATIVE = /^(?!\/\/)[\w\-./?=&%~+]+$/; // "page.html", "files/x.pdf": no scheme, not "//host"

/** True when a link or image URL is allowed (see the module comment). */
export const isSafeRichTextUrl = (value: string): boolean => {
  const url = value.trim();
  return SAFE_URL.test(url) || (SAFE_RELATIVE.test(url) && !url.includes(":"));
};

const filter = new FilterXSS({
  whiteList: ALLOWED,
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style", "iframe", "object", "embed", "noscript", "template"],
  allowCommentTag: false,
  onTag(tag, _html, options) {
    // h1 -> a bare h2. Never return the raw tag html from here: it has not been through the
    // attribute allow-list (an onclick= would survive).
    if (tag === "h1") return options.isClosing ? "</h2>" : "<h2>";
    return undefined;
  },
  onTagAttr(_tag, name, value) {
    // An unsafe URL removes the attribute entirely (an empty href would still be a link to the
    // current page). Returning undefined lets the allow-list and safeAttrValue handle the rest.
    if ((name === "href" || name === "src" || name === "cite") && !isSafeRichTextUrl(value))
      return "";
    return undefined;
  },
  safeAttrValue(tag, name, value) {
    if (name === "href" || name === "src" || name === "cite") {
      return isSafeRichTextUrl(value) ? escapeAttrValue(value) : "";
    }
    if (tag === "a" && name === "target") return value === "_blank" ? "_blank" : "";
    if (tag === "a" && name === "rel") return "noopener noreferrer";
    return escapeAttrValue(value);
  },
});

/** Sanitized HTML of an editor's rich text; links opening a new tab always get rel=noopener. */
export const sanitizeRichText = (html: string): string =>
  filter
    .process(html)
    .replace(
      /<a\b(?![^>]*\brel=)([^>]*\btarget="_blank"[^>]*)>/gi,
      '<a$1 rel="noopener noreferrer">',
    );
