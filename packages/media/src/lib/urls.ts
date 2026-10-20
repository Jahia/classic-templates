/** Schemes a contributed external URL may use. Anything else (javascript:, data:, ...) is dropped. */
const SAFE_EXTERNAL = /^(?:https?:\/\/|mailto:|tel:)/i;

/** True when `url` uses a scheme a visitor may safely be sent to. */
export const isSafeExternalUrl = (url: string): boolean => SAFE_EXTERNAL.test(url.trim());

/**
 * `url` when it is a site-relative path (one leading "/", no scheme, no host, no backslash, no
 * whitespace or control character), else undefined: "//host" and "/\host" name another host.
 */
export const safeLocalPath = (url: string | undefined): string | undefined => {
  if (!url || url.length > 2048) return undefined;
  if (!url.startsWith("/") || url.startsWith("//")) return undefined;
  // eslint-disable-next-line no-control-regex -- control characters are exactly what is refused
  if (/[\\\u0000-\u001f\u007f]/.test(url) || /\s/.test(url)) return undefined;
  return url;
};

/**
 * The site's page `page` (sign-in, registration) with `comeBack` as its `redirect` parameter, for
 * its form to bring the visitor back. Undefined when `page` is not site-relative; a `comeBack` that
 * is not is dropped.
 */
export const pageWithComeBack = (
  page: string | undefined,
  comeBack: string | undefined,
): string | undefined => {
  const safePage = safeLocalPath(page);
  if (!safePage) return undefined;
  const safe = safeLocalPath(comeBack);
  if (!safe) return safePage;
  const separator = safePage.includes("?") ? "&" : "?";
  return `${safePage}${separator}redirect=${encodeURIComponent(safe)}`;
};
