import { buildNodeUrl } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";

/** Schemes a contributed external URL may use. Anything else (javascript:, data:, ...) is dropped. */
const SAFE_EXTERNAL = /^(?:https?:\/\/|mailto:|tel:)/i;

export interface ResolvedLink {
  href: string;
  /** True for a contributed URL; views add rel="noopener" when it opens a new tab. */
  external: boolean;
  /** Title of the target page (internal) or the link title (external), if any. */
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

const read = (node: JCRNodeWrapper, name: string): string | undefined =>
  node.hasProperty(name) ? node.getProperty(name).getString() || undefined : undefined;

/**
 * Resolves the link stored by the ctplmix:linkTo mixin (Jahia's native link picker) on `node`,
 * in the language of the current session.
 *
 * - "internal": the picked page or content (j:linknode) through buildNodeUrl, so vanity URLs and
 *   the current language are honoured. A target that was deleted or is not visible in this
 *   workspace yields no link, never a broken one.
 * - "external": the contributed URL (j:url), only if its scheme is allow-listed.
 * - "none" or unset: no link.
 */
export const resolveLink = (node: JCRNodeWrapper): LinkState => {
  const type = read(node, "j:linkType");
  if (type === "internal") {
    if (!node.hasProperty("j:linknode")) return { missingTarget: true };
    try {
      const target = node.getProperty("j:linknode").getNode() as JCRNodeWrapper;
      return {
        link: {
          href: buildNodeUrl(target),
          external: false,
          targetTitle: read(target, "jcr:title"),
        },
        missingTarget: false,
      };
    } catch {
      // Target deleted, or not published / not readable in this workspace.
      return { missingTarget: true };
    }
  }
  if (type === "external") {
    const url = read(node, "j:url")?.trim();
    if (!url) return { missingTarget: true };
    if (!SAFE_EXTERNAL.test(url)) return { missingTarget: true };
    return {
      link: { href: url, external: true, targetTitle: read(node, "j:linkTitle") },
      missingTarget: false,
    };
  }
  return { missingTarget: false };
};
