import { useId } from "react";
import { useTranslation } from "react-i18next";
import { SignInPanel } from "../components/Content/SignIn/SignInPanel.jsx";
import classes from "./members-notice.module.css";

/**
 * What a visitor who is not signed in gets in place of members-only content: a "Members only"
 * heading (h2: the page template or the item owns the h1), a sentence saying what is reserved, a
 * "Create an account" link when the site has a registration page (`register`, from lib/register.ts),
 * and the sign-in form. `fallback` is the site-relative address to go to after signing in when the
 * page's address names no `redirect` of its own: the page being viewed.
 */
export const MembersNotice = ({
  text,
  fallback,
  register,
}: {
  text: string;
  fallback?: string;
  register?: string;
}) => {
  const { t } = useTranslation("classic-templates");
  const id = useId();
  return (
    <section className={classes.notice} aria-labelledby={id} data-testid="ctpl-members-notice">
      <h2 id={id} className={classes.title}>
        {t("members.title")}
      </h2>
      <p className={classes.text}>{text}</p>
      {register && (
        <p className={classes.register}>
          <a className={classes.registerLink} href={register} data-testid="ctpl-members-register">
            {t("members.register")}
          </a>
          <span className={classes.or}>{t("members.orSignIn")}</span>
        </p>
      )}
      <SignInPanel fallback={fallback} stay />
    </section>
  );
};
