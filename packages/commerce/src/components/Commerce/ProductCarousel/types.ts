import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { PickedProps, SectionProps } from "../shared/types.js";

/** Props of ctcm:productCarousel. */
export interface Props extends SectionProps, PickedProps {
  /** A shop folder of the shopify-edp mount, read when no product is picked. */
  shop?: JCRNodeWrapper;
  /** A Shopify product tag to keep, when reading a shop folder. */
  shopifyTag?: string;
  maxItems?: number;
  /** Shown when nothing matches; empty = the section is hidden on the live site. */
  noResultText?: string;
}
