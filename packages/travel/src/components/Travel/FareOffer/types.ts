import type { JCRNodeWrapper } from "org.jahia.services.content";

export type Cabin = "economy" | "premiumEconomy" | "business";

/** Props of ctrv:fareOffer (mix:title, ctrvmix:price, ctplmix:cta and its own fields). */
export interface Props {
  /** The offer's name: the page title. Cards show the destination's city. */
  "jcr:title"?: string;
  "destination"?: JCRNodeWrapper;
  /** Departure city, as shown ("Hong Kong"). */
  "origin"?: string;
  "cabin"?: Cabin;
  "price"?: number;
  "currency"?: string;
  "priceNote"?: string;
  /** ISO 8601 dates. */
  "travelFrom"?: string;
  "travelTo"?: string;
  "saleEnds"?: string;
  "conditions"?: string;
  /** Call to action (ctplmix:cta): its label; the link is resolved from the node. */
  "ctaLabel"?: string;
  "j:linkType"?: "none" | "internal" | "external";
}
