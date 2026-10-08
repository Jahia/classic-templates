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
  if (/[\\\s\u0000-\u001f\u007f]/.test(url)) return undefined;
  return url;
};

/** A context path as Jahia reports it: "" or "/name", never with a trailing slash. */
const normalise = (contextPath: string | undefined): string => {
  const path = (contextPath ?? "").trim().replace(/\/+$/, "");
  return path.startsWith("/") ? path : "";
};

export interface AccountUrls {
  /** Jahia's login page, which sends the visitor to `signInTo` once signed in. */
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
 */
export const accountUrls = (
  contextPath: string | undefined,
  signInTo: string | undefined,
  signOutTo: string | undefined,
): AccountUrls => {
  const base = normalise(contextPath);
  const withRedirect = (route: string, target: string | undefined) => {
    const safe = safeLocalPath(target);
    return `${base}${route}${safe ? `?redirect=${encodeURIComponent(safe)}` : ""}`;
  };
  return {
    signIn: withRedirect(LOGIN, signInTo),
    signOut: withRedirect(LOGOUT, signOutTo),
    graphql: `${base}${GRAPHQL}`,
  };
};
