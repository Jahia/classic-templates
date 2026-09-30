import type { JCRNodeWrapper } from "org.jahia.services.content";

export interface Props {
  "jcr:title"?: string;
  "body"?: string;
  "imagePosition"?: "left" | "right";
  "imageRatio"?: "landscape" | "square" | "portrait";
  "image"?: JCRNodeWrapper;
  /** Text alternative for this use of the image (ctplmix:media); defaults to its title. */
  "imageAlt"?: string;
  "imageDecorative"?: boolean;
  "ctaLabel"?: string;
  "j:linkType"?: "none" | "internal" | "external";
  "ctplSurface"?: "default" | "sunken" | "accent";
}
