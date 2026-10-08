import { buildNodeUrl, server } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper, JCRSessionWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";

/**
 * Runs `read` in a JCR session of the guest user on the live workspace, whoever renders the page.
 * Returns undefined when the session cannot be opened or `read` throws.
 *
 * For decisions that must not depend on the user who happens to render a cached fragment first:
 * "what does a visitor who is not signed in see?" has one answer, and this is how to ask it. Return
 * plain values (booleans, strings), never nodes: they would outlive the session.
 */
export const asGuest = <T>(read: (session: JCRSessionWrapper) => T): T | undefined => {
  try {
    return server.jcr.doExecuteAsGuest(read as never) as T;
  } catch {
    return undefined;
  }
};

/** True when a guest can read the node at `path` in the live workspace (it exists there and no ACL hides it). */
export const guestCanRead = (path: string): boolean =>
  asGuest((session) => session.nodeExists(path)) === true;

interface JCRTemplateApi {
  getInstance(): {
    doExecuteWithSystemSessionAsUser(
      user: null,
      workspace: string,
      locale: unknown,
      callback: unknown,
    ): unknown;
  };
}

/**
 * Runs `read` in a system session on `workspace`, for a lookup whose answer is public by design and
 * must not depend on who renders: the page an editor picked as the sign-in destination, which a
 * guest cannot read (a members area) but whose address the editor deliberately puts in a public
 * link. Return plain values (strings, booleans), never nodes: they would outlive the session.
 * Returns undefined when the session cannot be opened or `read` throws.
 */
export const asSystem = <T>(
  workspace: string,
  locale: unknown,
  read: (session: JCRSessionWrapper) => T,
): T | undefined => {
  try {
    const template = Java.type<JCRTemplateApi>("org.jahia.services.content.JCRTemplate");
    return template
      .getInstance()
      .doExecuteWithSystemSessionAsUser(null, workspace, locale, read) as T;
  } catch {
    return undefined;
  }
};

/**
 * The address of the page with this identifier, whoever renders: registers it as a cache
 * dependency, then looks it up in a system session so a page the rendering user cannot read (a
 * members area) still yields its address. Public by design: it is the page an editor chose to point
 * to from public content. Undefined when the page is gone or not published yet.
 */
export const pageUrlById = (
  identifier: string,
  renderContext: RenderContext,
  locale: unknown,
): string | undefined => {
  try {
    server.render.addCacheDependency({ uuid: identifier }, renderContext);
  } catch {
    // Not readable by the rendering user: the system lookup below still finds it.
  }
  return asSystem(renderContext.getWorkspace(), locale, (session) =>
    buildNodeUrl(session.getNodeByIdentifier(identifier) as JCRNodeWrapper),
  );
};
