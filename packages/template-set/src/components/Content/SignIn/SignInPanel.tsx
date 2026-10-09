import { Island, buildNodeUrl, useServerContext } from "@jahia/javascript-modules-library";
import { accountUrls, loginRoute } from "../../../lib/account.js";
import { chromeOwner, pageSite } from "../../../lib/site.js";
import SignInForm from "./SignInForm.client.jsx";
import classes from "./sign-in.module.css";

/**
 * The sign-in form as an island, for the sign-in section (view of ctpl:signIn) and for the teaser
 * of a members-only item or page.
 *
 * `stay` makes the form reload the page it is on after signing in (the teaser of a members-only
 * item or page); `fallback` is the site-relative address to go to after signing in when the page's address names
 * no `redirect` of its own: the teaser passes the page it is on, the sign-in section the page its
 * editor chose (else the home page). `signedInAs` shows who is signed in instead of the form: only
 * a view cached per user may pass it.
 *
 * The props are the same for every visitor who is not signed in, so the markup can sit in a shared
 * cached fragment.
 */
export const SignInPanel = ({
  fallback,
  stay,
  preview,
  signedInAs,
}: {
  fallback?: string;
  stay?: boolean;
  preview?: boolean;
  signedInAs?: string;
}) => {
  const { renderContext } = useServerContext();
  const site = pageSite(renderContext);
  const contextPath = renderContext.getRequest().getContextPath();
  const urls = accountUrls(contextPath, undefined, buildNodeUrl(chromeOwner(site)));
  return (
    <div className={classes.panel} data-testid="ctpl-sign-in-panel">
      <Island
        component={SignInForm}
        props={{
          loginUrl: loginRoute(contextPath),
          logoutUrl: urls.signOut,
          siteKey: site.getSiteKey(),
          fallback,
          stay,
          preview,
          signedInAs,
        }}
      />
    </div>
  );
};
