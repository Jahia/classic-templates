import { useServerContext } from "@jahia/javascript-modules-library";
import { useId } from "react";
import { useT } from "../../../lib/i18n.js";
import { membersLinks } from "../../../lib/members.js";
import { RichText } from "../../../lib/RichText.js";
import { teaserHtml } from "../../../lib/teaser.js";
import classes from "./members-wall.module.css";

/**
 * Where a members-only story or session stops for a visitor who is not signed in: the opening
 * paragraphs of the body (`opening`, already cut by lib/teaser.ts: the rest is never sent), fading
 * out, then a notice with "Create an account" (the site's registration page) and "Sign in" (its
 * sign-in page), both bringing the visitor back to the item. Only the links the site header names
 * are shown, and the notice's wording follows: it never mentions an account nobody can create.
 */
export const MembersWall = ({
  body,
  paragraphs,
  kind,
}: {
  body?: string;
  paragraphs: number;
  /** Which item it is, for the notice's wording ("story.membersNotice"...). */
  kind: "story" | "session";
}) => {
  const t = useT();
  const id = useId();
  const { currentNode, renderContext } = useServerContext();
  const opening = teaserHtml(body, paragraphs);
  const { signIn, register } = membersLinks(currentNode, renderContext);
  return (
    <>
      {opening && (
        <div className={classes.opening} data-testid="ctmd-members-opening">
          <RichText html={opening} headingLevel={2} />
        </div>
      )}
      <section className={classes.notice} aria-labelledby={id} data-testid="ctmd-members-notice">
        <h2 id={id} className={classes.title}>
          {t("members.title")}
        </h2>
        <p>{t(register ? `${kind}.membersNotice` : `${kind}.membersNoticeSignIn`)}</p>
        {(register || signIn) && (
          <p className={classes.actions}>
            {register && (
              <a className={classes.primary} href={register} data-testid="ctmd-members-register">
                {t("members.register")}
              </a>
            )}
            {signIn && (
              <a
                className={register ? classes.secondary : classes.primary}
                href={signIn}
                data-testid="ctmd-members-sign-in"
              >
                {t("members.signIn")}
              </a>
            )}
          </p>
        )}
      </section>
    </>
  );
};
