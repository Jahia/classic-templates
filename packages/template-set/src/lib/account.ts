/**
 * URLs of the header's sign-in / sign-out entry.
 *
 * They are platform routes, not contributed links: Jahia's own login and logout servlets, under the
 * web application's context path (empty on a standard install, "/something" behind a prefix). Both
 * take a `redirect` parameter naming where to come back to. The login servlet refuses a redirect to
 * another host, and the logout servlet falls back to the site root, but this module never relies on
 * that: it only ever passes a site-relative path.
 */

const LOGIN = "/cms/login";
const LOGOUT = "/cms/logout";
const GRAPHQL = "/modules/graphql";

/**
 * `url` when it is a site-relative path (starts with one "/", no scheme, no host, no backslash, no
 * whitespace or control character), else undefined. A protocol-relative "//host" and "/\host" are
 * refused: browsers read both as another host.
 */
export const safeLocalPath = (url: string | undefined): string | undefined => {
  if (!url || url.length > 2048) return undefined;
  if (!url.startsWith("/") || url.startsWith("//")) return undefined;
  // eslint-disable-next-line no-control-regex -- control characters are exactly what is refused
  if (/[\\\u0000-\u001f\u007f]/.test(url) || /\s/.test(url)) return undefined;
  return url;
};

/** A context path as Jahia reports it: "" or "/name", never with a trailing slash. */
const normalise = (contextPath: string | undefined): string => {
  const path = (contextPath ?? "").trim().replace(/\/+$/, "");
  return path.startsWith("/") ? path : "";
};

/**
 * Jahia's login servlet, the route a sign-in form posts to (`restMode=true` makes it answer "OK" or
 * "unauthorized" instead of redirecting). Under the web application's context path.
 */
export const loginRoute = (contextPath: string | undefined): string =>
  `${normalise(contextPath)}${LOGIN}`;

export interface AccountUrls {
  /**
   * Where the "Sign in" link goes: Jahia's login page, or the site's own sign-in page when one is
   * given. Either way the visitor ends up on `signInTo` once signed in.
   */
  signIn: string;
  /** Jahia's logout servlet, which sends the visitor to `signOutTo` once signed out. */
  signOut: string;
  /** The GraphQL endpoint the island asks who the visitor is. */
  graphql: string;
}

/**
 * The three URLs of the account entry. `signInTo` and `signOutTo` must be site-relative paths (see
 * safeLocalPath); one that is not is dropped, which leaves a plain login or logout with Jahia's
 * default destination.
 *
 * `signInPage` is the site-relative address of the site's own sign-in page. When it is a safe path
 * the "Sign in" link goes there instead of to Jahia's login screen, carrying `signInTo` as its
 * `redirect` parameter (the page's sign-in form reads it, see lib/signin.ts); otherwise the link
 * is Jahia's login route as before.
 */
export const accountUrls = (
  contextPath: string | undefined,
  signInTo: string | undefined,
  signOutTo: string | undefined,
  signInPage?: string,
): AccountUrls => {
  const base = normalise(contextPath);
  const withRedirect = (route: string, target: string | undefined) => {
    const safe = safeLocalPath(target);
    const query = safe ? `?redirect=${encodeURIComponent(safe)}` : "";
    return `${route}${query}`;
  };
  const page = safeLocalPath(signInPage);
  return {
    signIn: page ? withRedirect(page, signInTo) : withRedirect(`${base}${LOGIN}`, signInTo),
    signOut: withRedirect(`${base}${LOGOUT}`, signOutTo),
    graphql: `${base}${GRAPHQL}`,
  };
};
