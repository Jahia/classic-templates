import { server } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { readNumber, readReference, readString } from "./props.js";
import type { DestinationEntry, FareEntry } from "./select.js";

/** What cards and lists show of a destination, read from its node. */
export interface DestinationData {
  node: JCRNodeWrapper;
  title?: string;
  airportCode?: string;
  country?: string;
  region?: string;
  image?: JCRNodeWrapper;
  price?: number;
  currency?: string;
  priceNote?: string;
}

/**
 * A destination's card data. Pass `renderContext` when the caller renders it from another node
 * (a fare's card): the destination is then a cache dependency, so renaming the city or changing
 * its image refreshes the fare's cached card.
 */
export const readDestination = (
  node: JCRNodeWrapper,
  renderContext?: RenderContext,
): DestinationData => {
  if (renderContext) server.render.addCacheDependency({ node }, renderContext);
  return {
    node,
    title: readString(node, "jcr:title"),
    airportCode: readString(node, "airportCode"),
    country: readString(node, "country"),
    region: readString(node, "region"),
    image: readReference(node, "image"),
    price: readNumber(node, "price"),
    currency: readString(node, "currency"),
    priceNote: readString(node, "priceNote"),
  };
};

/** The destination a fare offer points at, when it resolves here (set, not deleted, published). */
export const fareDestination = (
  fare: JCRNodeWrapper,
  renderContext?: RenderContext,
): DestinationData | undefined => {
  const node = readReference(fare, "destination");
  return node ? readDestination(node, renderContext) : undefined;
};

/** A fare offer as a list entry (lib/select.ts), with its node. */
export const fareEntry = (
  fare: JCRNodeWrapper,
  renderContext: RenderContext,
): FareEntry & { node: JCRNodeWrapper } => {
  const destination = fareDestination(fare, renderContext);
  return {
    id: fare.getIdentifier(),
    node: fare,
    price: readNumber(fare, "price"),
    saleEnds: readString(fare, "saleEnds"),
    destinationTitle: destination?.title,
    region: destination?.region,
  };
};

/** A destination as a list entry (lib/select.ts), with its node. */
export const destinationEntry = (
  node: JCRNodeWrapper,
): DestinationEntry & { node: JCRNodeWrapper } => ({
  id: node.getIdentifier(),
  node,
  title: readString(node, "jcr:title"),
  region: readString(node, "region"),
});

/** The destinations a destination page links to, when they resolve here (W5: no null entries). */
export const relatedDestinations = (node: JCRNodeWrapper): JCRNodeWrapper[] => {
  if (!node.hasProperty("relatedDestinations")) return [];
  const related: JCRNodeWrapper[] = [];
  for (const value of node.getProperty("relatedDestinations").getValues()) {
    try {
      const target = (value as unknown as { getNode(): JCRNodeWrapper | null }).getNode();
      if (target && target.getIdentifier() !== node.getIdentifier()) related.push(target);
    } catch {
      // deleted, or not published in this workspace
    }
  }
  return related;
};
