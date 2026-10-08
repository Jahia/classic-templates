import { buildNodeUrl, server } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { asSystem } from "./access.js";
import { readString as read } from "./props.js";
import { titleOf } from "./title.js";

import { isSafeExternalUrl } from "./urls.js";

export { isSafeExternalUrl } from "./urls.js";

export interface ResolvedLink {
  href: string;
  /** True for a contributed URL; views add rel="noopener" when it opens a new tab. */
  external: boolean;
  /**
   * Title of the target page (internal, in the site's default language when not translated yet)
   * or the link title (external), if any.
   */
  targetTitle?: string;
}

export interface LinkState {
  /** The link to render, or undefined when there is nothing safe to link to. */
  link?: ResolvedLink;
  /**
   * True when the editor chose a link type but this language has no target. Link targets are
   * i18n (j:linknode and j:url), so a link set in one language is absent in the others: views
   * show a hint in edit mode so the editor notices.
   */
  missingTarget: boolean;
}

/** The "internal" branch of resolveLink: the picked page or content (j:linknode). */
const resolveInternal = (node: JCRNodeWrapper, renderContext?: RenderContext): LinkState => {
  if (!node.hasProperty("j:linknode")) return { missingTarget: true };
  const reference = node.getProperty("j:linknode");
  try {
    const target = reference.getNode() as JCRNodeWrapper;
    if (renderContext) server.render.addCacheDependency({ node: target }, renderContext);
    return {
      link: {
        href: buildNodeUrl(target),
        external: false,
        targetTitle: titleOf(target),
      },
      missingTarget: false,
    };
  } catch {
    // Target deleted, or not published / not readable by this visitor in this workspace. The
    // fragment still depends on it: publishing the page, or opening its access, must replace the
    // cached "no link" with the link (a dependency recorded only on success never fires). A guest
    // cannot resolve the identifier itself, so the path is looked up outside the visitor's rights.
    if (renderContext) {
      const path = asSystem(renderContext.getWorkspace(), node.getSession().getLocale(), (s) =>
        s.getNodeByIdentifier(reference.getString()).getPath(),
      );
      if (path) server.render.addCacheDependency({ path }, renderContext);
    }
    return { missingTarget: true };
  }
};

/** The "external" branch of resolveLink: the contributed URL (j:url), if allow-listed. */
const resolveExternal = (node: JCRNodeWrapper): LinkState => {
  const url = read(node, "j:url")?.trim();
  if (!url || !isSafeExternalUrl(url)) return { missingTarget: true };
  return {
    link: { href: url, external: true, targetTitle: read(node, "j:linkTitle") },
    missingTarget: false,
  };
};

/**
 * Resolves the link stored by the ctplmix:linkTo mixin (Jahia's native link picker) on `node`,
 * in the language of the current session.
 *
 * - "internal": the picked page or content (j:linknode) through buildNodeUrl, so vanity URLs and
 *   the current language are honoured. A target that was deleted, is not published yet, or that
 *   the visitor may not read yields no link, never a broken one: a guest never gets a link to a
 *   members-only page. The cached fragment is varied by the visitor's groups by Jahia itself (the
 *   groups signature of its ACL cache key), so a signed-in visitor's link is not served to a guest.
 * - "external": the contributed URL (j:url), only if its scheme is allow-listed.
 * - "none" or unset: no link.
 *
 * Pass `renderContext` when the caller shows the target's title: the target is then declared as a
 * cache dependency, so renaming the target page refreshes the cached link.
 */
export const resolveLink = (node: JCRNodeWrapper, renderContext?: RenderContext): LinkState => {
  const type = read(node, "j:linkType");
  if (type === "internal") return resolveInternal(node, renderContext);
  if (type === "external") return resolveExternal(node);
  return { missingTarget: false };
};
