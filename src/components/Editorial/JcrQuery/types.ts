import type { JCRNodeWrapper } from "org.jahia.services.content";

export interface Props {
  "jcr:title"?: string;
  /** Node type name to list, a subtype of ctplmix:listable (e.g. "ctpl:news"). */
  "type"?: string;
  "startNode"?: JCRNodeWrapper;
  "criteria"?: "publicationDate" | "jcr:created" | "jcr:lastModified" | "jcr:title";
  "sortDirection"?: "desc" | "asc";
  "maxItems"?: number;
  "layout"?: "grid" | "list";
  "excludeNodes"?: JCRNodeWrapper[];
  "noResultText"?: string;
  "ctaLabel"?: string;
  "j:linkType"?: "none" | "internal" | "external";
  "ctplSurface"?: "default" | "sunken" | "accent";
}
