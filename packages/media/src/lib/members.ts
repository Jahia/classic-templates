import { buildNodeUrl, server } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { readReference } from "./props.js";
import { teaserParagraphs } from "./teaser.js";
import { pageWithComeBack } from "./urls.js";

/**
 * True for an item switched to "Members only" (ctplmix:membersOnly of classic-templates, offered
 * on stories and sessions).
 */
export const isMembersOnly = (node: JCRNodeWrapper): boolean =>
  node.hasProperty("ctplMembersOnly") && node.getProperty("ctplMembersOnly").getBoolean();

/** Paragraphs of the body shown before the members notice (ctplTeaserParagraphs, 2 by default). */
export const teaserParagraphsOf = (node: JCRNodeWrapper): number => {
  try {
    return teaserParagraphs(
      node.hasProperty("ctplTeaserParagraphs")
        ? node.getProperty("ctplTeaserParagraphs").getLong()
        : undefined,
    );
  } catch {
    return teaserParagraphs(undefined);
  }
};

export interface MembersLinks {
  /** The site's sign-in page, bringing the visitor back to `node`. */
  signIn?: string;
  /** The site's registration page, bringing the visitor back to `node`. */
  register?: string;
}

/**
 * The sign-in and registration pages the classic-templates site header names (signInPage,
 * registerPage), each with the item as the place to come back to. The header is a cache
 * dependency: changing either page refreshes the notices.
 */
export const membersLinks = (node: JCRNodeWrapper, renderContext: RenderContext): MembersLinks => {
  let header: JCRNodeWrapper;
  try {
    header = node.getResolveSite().getHome().getNode("siteHeader/header");
  } catch {
    return {};
  }
  server.render.addCacheDependency({ node: header }, renderContext);
  const here = buildNodeUrl(node);
  const link = (name: string) => {
    const page = readReference(header, name);
    return page ? pageWithComeBack(buildNodeUrl(page), here) : undefined;
  };
  return { signIn: link("signInPage"), register: link("registerPage") };
};
