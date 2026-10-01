import { getChildNodes } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { readString } from "../../../lib/props.js";
import { resolveLink } from "../../../lib/resolveLink.js";
import type { Display } from "./display.js";

/** The news item or article a teaser shows, when it resolves here and has a title. */
export const teaserTarget = (teaser: JCRNodeWrapper): JCRNodeWrapper | undefined => {
  try {
    if (!teaser.hasProperty("j:node")) return undefined;
    const target = teaser.getProperty("j:node").getNode() as JCRNodeWrapper;
    return readString(target, "jcr:title") ? target : undefined;
  } catch {
    return undefined; // deleted, or not published / not readable in this workspace
  }
};

/** A written card shows something when it has a heading (own or lent by its link), text or image. */
export const cardShows = (card: JCRNodeWrapper) =>
  Boolean(
    readString(card, "jcr:title") ||
    readString(card, "text") ||
    card.hasProperty("image") ||
    resolveLink(card).link?.targetTitle,
  );

/** A card shows in a logo strip when it has an image; teasers never do. */
const showsIn = (display: Display, node: JCRNodeWrapper): boolean => {
  if (node.isNodeType("ctpl:card")) {
    return display === "logos" ? node.hasProperty("image") : cardShows(node);
  }
  return display !== "logos" && node.isNodeType("ctpl:contentTeaser") && !!teaserTarget(node);
};

/** True when at least one child renders on the live site: the same tests as the child views. */
export const hasVisibleCard = (grid: JCRNodeWrapper, display: Display) =>
  getChildNodes(grid, -1, 0, (n: JCRNodeWrapper) => showsIn(display, n)).length > 0;
