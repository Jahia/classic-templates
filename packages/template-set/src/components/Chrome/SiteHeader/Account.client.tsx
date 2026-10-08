import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import classes from "./account.module.css";

interface Props {
  /** Jahia's login page, with the page to come back to. */
  signInHref: string;
  /** Jahia's logout servlet, with the page to come back to. */
  signOutHref: string;
  /** The GraphQL endpoint that tells who the visitor is. */
  graphqlUrl: string;
}

const WHO = "{ currentUser { username displayName } }";

/** The visitor's name, or undefined for a guest, an error or an answer in an unexpected shape. */
const nameOf = (answer: unknown): string | undefined => {
  const user = (
    answer as { data?: { currentUser?: { username?: unknown; displayName?: unknown } } } | undefined
  )?.data?.currentUser;
  if (!user || typeof user.username !== "string" || user.username === "guest") return undefined;
  return typeof user.displayName === "string" && user.displayName
    ? user.displayName
    : user.username;
};

/**
 * The header's account entry: "Sign in" for a guest, the visitor's name and "Sign out" for a
 * signed-in user.
 *
 * The server renders the guest version into the cached header, the same for everybody. Here the
 * island asks the platform who the visitor is (GraphQL `currentUser`, same origin, with the
 * session cookie) and swaps the sign-in link for the name and the sign-out link. A failed or
 * refused request leaves the sign-in link, which is always correct for someone not recognised.
 */
export default function Account({ signInHref, signOutHref, graphqlUrl }: Props) {
  const { t } = useTranslation("classic-templates");
  const [name, setName] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();
    fetch(graphqlUrl, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: WHO }),
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : undefined))
      .then((answer) => setName(nameOf(answer)))
      .catch(() => undefined);
    return () => controller.abort();
  }, [graphqlUrl]);

  if (!name) {
    return (
      <a className={classes.link} href={signInHref} data-testid="ctpl-account-sign-in">
        {t("account.signIn")}
      </a>
    );
  }
  return (
    <span className={classes.signedIn} data-testid="ctpl-account-user">
      <span className={classes.name} data-testid="ctpl-account-name">
        <span className="ctpl-visually-hidden">{t("account.signedInAs")} </span>
        {name}
      </span>
      <a className={classes.link} href={signOutHref} data-testid="ctpl-account-sign-out">
        {t("account.signOut")}
      </a>
    </span>
  );
}
