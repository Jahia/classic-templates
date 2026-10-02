import type { JCRNodeWrapper } from "org.jahia.services.content";

export interface Props {
  /** Visible name of the band, also its accessible name. */
  "label"?: string;
  /** Node type name to list, a subtype of ctplmix:listable (e.g. "ctpl:news"). */
  "type"?: string;
  "startNode"?: JCRNodeWrapper;
  /** Categories an item must carry (any of them, subcategories included). */
  "filterCategories"?: JCRNodeWrapper[];
  "maxItems"?: number;
  /** Label before each item: none (default), its type, or its first category's title. */
  "itemLabel"?: "none" | "type" | "category";
  "dismissible"?: boolean;
  "ctaLabel"?: string;
  "j:linkType"?: "none" | "internal" | "external";
}
