import type { JCRNodeWrapper } from "org.jahia.services.content";

export interface Props {
  "jcr:title"?: string;
  "body"?: string;
  "imagePosition"?: "left" | "right";
  "imageRatio"?: "landscape" | "square" | "portrait";
  "image"?: JCRNodeWrapper;
  "ctaLabel"?: string;
  "j:linkType"?: "none" | "internal" | "external";
  "ctplSurface"?: "default" | "sunken" | "accent";
}
