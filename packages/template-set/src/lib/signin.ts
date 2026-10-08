import { safeLocalPath } from "./account.js";

/**
 * Logic of the in-site sign-in form, kept free of the DOM and of Jahia so it is unit-tested: where
 * to go once signed in, and how to read the platform's answer.
 */

/**
 * Where to send the visitor after a successful sign-in, first match wins:
 * 1. the `redirect` parameter of the page's own address, when it is a safe site-relative path (see
 *    safeLocalPath);
 * 2. `current`, the address the visitor is on, for a form that sits on the page it unlocks (the
 *    teaser of a members-only item or page): signing in then reloads that very page, language prefix
 *    and query string kept;
 * 3. `fallback`, an address the server chose (the sign-in section's "page after sign-in", else home);
 * else undefined (the caller then reloads the page).
 *
 * `search` is `window.location.search` and `current` is `pathname + search`: both are read in the
 * browser, never on the server, because the rendered page is cached without its query string. Every
 * candidate must be a plain path on this host (another site, a scheme, "//host" are never followed).
 */
export const destinationOf = (
  search: string,
  fallback?: string,
  current?: string,
): string | undefined => {
  let requested: string | null = null;
  try {
    requested = new URLSearchParams(search).get("redirect");
  } catch {
    requested = null;
  }
  return safeLocalPath(requested ?? undefined) ?? safeLocalPath(current) ?? safeLocalPath(fallback);
};

export type LoginOutcome = "signedIn" | "rejected" | "unknown";

/**
 * Reads the answer of Jahia's login servlet called with `restMode=true`: a bare "OK" for a signed-in
 * visitor, "unauthorized" for wrong credentials. A redirect (a servlet that was not in rest mode)
 * also means the session was opened. Anything else is an unknown failure, not a refusal.
 */
export const loginOutcome = (answer: {
  ok: boolean;
  redirected: boolean;
  body: string;
}): LoginOutcome => {
  const body = answer.body.trim().toLowerCase();
  if ((answer.ok && body === "ok") || answer.redirected) return "signedIn";
  if (body === "unauthorized") return "rejected";
  return "unknown";
};
