import type { JCRNodeWrapper } from "org.jahia.services.content";

export interface Props {
  "jcr:title"?: string;
  "eyebrow"?: string;
  "subtitle"?: string;
  "variant"?: "image" | "split" | "plain";
  "overlay"?: "medium" | "strong";
  "height"?: "compact" | "medium" | "tall";
  "image"?: JCRNodeWrapper;
  "ctaLabel"?: string;
  "j:linkType"?: "none" | "internal" | "external";
}
