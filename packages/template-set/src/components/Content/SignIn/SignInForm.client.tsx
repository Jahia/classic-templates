import { type FormEvent, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { destinationOf, loginOutcome } from "../../../lib/signin.js";
import classes from "./sign-in.module.css";

interface Props {
  /** Jahia's login servlet (`<contextPath>/cms/login`). */
  loginUrl: string;
  /** Jahia's logout servlet, with the page to come back to. Used when the visitor is signed in. */
  logoutUrl: string;
  /** Key of the page's site, passed to the servlet so a site-scoped user is found. */
  siteKey?: string;
  /** Where to go after signing in when the address names no (safe) `redirect` parameter. */
  fallback?: string;
  /**
   * The form sits on the page it unlocks (teaser of a members-only item or page): after signing in,
   * reload the address the visitor is on, rather than `fallback`.
   */
  stay?: boolean;
  /** Edit mode (Page Builder): the form is shown as visitors see it, but nothing can be submitted. */
  preview?: boolean;
  /** The signed-in visitor's name, known when the server rendered it for a signed-in visitor. */
  signedInAs?: string;
}

/** Where the visitor goes after signing in (lib/signin.ts decides): read in the browser only. */
const nextAddress = (fallback: string | undefined, stay: boolean | undefined) =>
  destinationOf(
    window.location.search,
    fallback,
    stay ? window.location.pathname + window.location.search : undefined,
  );

/** Full navigation to `destination`, or a reload of the page when there is none. */
const go = (destination: string | undefined) => {
  if (destination) window.location.assign(destination);
  else window.location.reload();
};

/**
 * The in-site sign-in form: username, password, one button.
 *
 * It posts to Jahia's own login servlet in `restMode` (the call the platform's login page and the
 * persona panel make): the answer is a bare "OK" or "unauthorized", the session cookie is set on
 * the response, and the visitor stays on the site. On success it navigates (a full navigation, so
 * the destination is rendered again as the new user) to the page's `redirect` parameter when it is a
 * safe site-relative path, else to `fallback` (lib/signin.ts decides; both are read in the browser,
 * the server render is cached without the query string).
 *
 * The server output is the same for every visitor who is not signed in, so one cached fragment
 * serves them all. Without JavaScript the form does nothing: signing in needs the island.
 */
export default function SignInForm({
  loginUrl,
  logoutUrl,
  siteKey,
  fallback,
  stay,
  preview,
  signedInAs,
}: Readonly<Props>) {
  const { t } = useTranslation("classic-templates");
  const id = useId();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<"rejected" | "unknown">();

  if (signedInAs) {
    return (
      <div className={classes.signedIn} data-testid="ctpl-sign-in-done">
        <p className={classes.signedInText}>
          {t("signin.signedInAs", { name: signedInAs, interpolation: { escapeValue: false } })}
        </p>
        <p className={classes.actions}>
          <button
            className={classes.button}
            type="button"
            onClick={() => go(nextAddress(fallback, stay))}
            data-testid="ctpl-sign-in-continue"
          >
            {t("signin.continue")}
          </button>
          <a className={classes.link} href={logoutUrl} data-testid="ctpl-sign-in-sign-out">
            {t("account.signOut")}
          </a>
        </p>
      </div>
    );
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (preview || busy || !username || !password) return;
    setBusy(true);
    setError(undefined);
    const query = new URLSearchParams({ restMode: "true" });
    if (siteKey) query.set("site", siteKey);
    try {
      const response = await fetch(`${loginUrl}?${query}`, {
        method: "POST",
        body: new URLSearchParams({ username, password }),
        credentials: "same-origin",
      });
      const outcome = loginOutcome({
        ok: response.ok,
        redirected: response.redirected,
        body: await response.text(),
      });
      if (outcome === "signedIn") {
        // Stay busy: a second submit must not start while the page loads again.
        go(nextAddress(fallback, stay));
        return;
      }
      setError(outcome);
    } catch {
      setError("unknown");
    }
    setBusy(false);
  };

  const errorId = `${id}-error`;
  return (
    <form
      className={classes.form}
      onSubmit={submit}
      aria-label={t("signin.formLabel")}
      data-testid="ctpl-sign-in-form"
    >
      {error && (
        <p className={classes.error} id={errorId} role="alert" data-testid="ctpl-sign-in-error">
          {t(error === "rejected" ? "signin.rejected" : "signin.unknown")}
        </p>
      )}
      <div className={classes.field}>
        <label className={classes.label} htmlFor={`${id}-username`}>
          {t("signin.username")}
        </label>
        <input
          className={classes.input}
          id={`${id}-username`}
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          disabled={preview}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          aria-invalid={error === "rejected" ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
      </div>
      <div className={classes.field}>
        <label className={classes.label} htmlFor={`${id}-password`}>
          {t("signin.password")}
        </label>
        <input
          className={classes.input}
          id={`${id}-password`}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={preview}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={error === "rejected" ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
      </div>
      <button
        className={classes.button}
        type="submit"
        disabled={busy || preview}
        data-testid="ctpl-sign-in-submit"
      >
        {busy ? t("signin.submitting") : t("signin.submit")}
      </button>
    </form>
  );
}
