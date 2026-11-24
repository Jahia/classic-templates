import type { JCRNodeWrapper } from "org.jahia.services.content";

/** Fields every classic-commerce section shares: title, surface and call to action. */
export interface SectionProps {
  "jcr:title"?: string;
  /** ctplmix:sectionStyle */
  "ctplSurface"?: "default" | "sunken" | "accent";
  /** ctplmix:cta */
  "ctaLabel"?: string;
  "ctaAudience"?: "everyone" | "guests" | "members";
  "j:linkType"?: "none" | "internal" | "external";
}

/** ctplmix:media */
export interface MediaProps {
  image?: JCRNodeWrapper;
  imageAlt?: string;
  imageDecorative?: boolean;
}

/** ctcmmix:pickedProducts */
export interface PickedProps {
  /** Products picked by the editor; a deleted or unreachable product is null and skipped. */
  products?: (JCRNodeWrapper | null)[];
}
