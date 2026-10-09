import { buildNodeUrl, jahiaComponent, server } from "@jahia/javascript-modules-library";
import { pageUrlById } from "../../../lib/access.js";
import { SectionHeading } from "../../../lib/Heading.js";
import { Section } from "../../../lib/Section.js";
import { chromeOwner, pageSite } from "../../../lib/site.js";
import { SignInPanel } from "./SignInPanel.jsx";
import type { Props } from "./types.js";
import classes from "./sign-in.module.css";

/**
 * A sign-in section: an optional heading, an introduction and the sign-in form (SignInPanel).
 *
 * Cached per user (`cache.perUser`): a visitor who is already signed in sees who they are, with a
 * "Continue" link and "Sign out", instead of the form. The form itself is an island that reads the
 * `redirect` parameter in the browser, so the cached markup never depends on the address.
 *
 * The page to fall back to (no `redirect` in the address) is the editor's "afterSignIn" page, else
 * the home page: the section usually sits on a page of its own, where "stay here" would go nowhere.
 */
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctpl:signIn",
    displayName: "Sign in",
    properties: { "cache.perUser": "true" },
  },
  (
    { "jcr:title": title, introText, ctplSurface }: Props,
    { currentNode, currentResource, renderContext },
  ) => {
    const headingId = `ctpl-signin-${currentNode.getIdentifier()}`;
    const site = pageSite(renderContext);
    server.render.addCacheDependency({ node: site }, renderContext);
    const chosen = currentNode.hasProperty("afterSignIn")
      ? currentNode.getProperty("afterSignIn").getString()
      : undefined;
    const fallback =
      (chosen && pageUrlById(chosen, renderContext, currentResource.getLocale())) ||
      buildNodeUrl(chromeOwner(site));
    const user = renderContext.getUser();
    // In Page Builder the editor is signed in, and "Sign out" would end their session: show the form instead.
    const editMode = renderContext.isEditMode();
    const signedInAs =
      renderContext.isLoggedIn() && !editMode ? String(user.getUsername()) : undefined;

    return (
      <Section
        surface={ctplSurface}
        testId="ctpl-sign-in"
        labelledBy={title ? headingId : undefined}
      >
        <div className="ctpl-container">
          {title && (
            <SectionHeading node={currentNode} id={headingId}>
              {title}
            </SectionHeading>
          )}
          {introText && <p className={classes.intro}>{introText}</p>}
          <SignInPanel fallback={fallback} preview={editMode} signedInAs={signedInAs} />
        </div>
      </Section>
    );
  },
);
