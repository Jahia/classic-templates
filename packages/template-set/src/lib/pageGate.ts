import { server } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { nearestFlagged } from "./members.js";

/** True when the page carries the "Members only" option (ctplmix:pageOptions) and it is on. */
const isFlagged = (page: JCRNodeWrapper): boolean =>
  page.hasProperty("ctplMembersOnly") && page.getProperty("ctplMembersOnly").getBoolean();

/** The page above `page`, or undefined at the top of the page tree (the site node is not a page). */
const parentPage = (page: JCRNodeWrapper): JCRNodeWrapper | undefined => {
  try {
    const parent = page.getParent() as JCRNodeWrapper;
    return parent.isNodeType("jnt:page") ? parent : undefined;
  } catch {
    return undefined;
  }
};

/**
 * The page that makes `page` members-only: the page itself when its option is on, else its nearest
 * ancestor page whose option is on (a members area gates every page below it), else undefined.
 *
 * Every page looked at is a cache dependency, so switching the option on or off on a parent
 * refreshes the pages below it (a page's own change refreshes it anyway).
 */
export const gatingPageOf = (
  page: JCRNodeWrapper,
  renderContext: RenderContext,
): JCRNodeWrapper | undefined =>
  nearestFlagged(page, isFlagged, parentPage, (visited) =>
    server.render.addCacheDependency({ node: visited }, renderContext),
  );
