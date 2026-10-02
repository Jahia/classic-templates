import type { JCRNodeWrapper } from "org.jahia.services.content";

/** ctpl:quote */
export interface Props {
  quote?: string;
  author?: string;
  authorRole?: string;
  variant?: "standard" | "large";
  /** Portrait of the person quoted. */
  image?: JCRNodeWrapper;
  ctplSurface?: "default" | "sunken" | "accent";
}
