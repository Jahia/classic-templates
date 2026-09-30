import type { JCRNodeWrapper } from "org.jahia.services.content";

export interface Props {
  "jcr:title"?: string;
  "eyebrow"?: string;
  "subtitle"?: string;
  "variant"?: "image" | "split" | "plain";
  "overlay"?: "medium" | "strong";
  "height"?: "compact" | "medium" | "tall";
  "image"?: JCRNodeWrapper;
  /** Text alternative for this use of the image (ctplmix:media); defaults to its title. */
  "imageAlt"?: string;
  "imageDecorative"?: boolean;
  "ctaLabel"?: string;
  "j:linkType"?: "none" | "internal" | "external";
}
