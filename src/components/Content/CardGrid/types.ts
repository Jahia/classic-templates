import type { JCRNodeWrapper } from "org.jahia.services.content";

/** ctpl:cardGrid */
export interface Props {
  "jcr:title"?: string;
  "columns"?: "2" | "3" | "4";
  "introText"?: string;
  "ctplSurface"?: "default" | "sunken" | "accent";
}

/** ctpl:card */
export interface CardProps {
  "jcr:title"?: string;
  "text"?: string;
  "linkLabel"?: string;
  "image"?: JCRNodeWrapper;
  "j:linkType"?: "none" | "internal" | "external";
}

/** ctpl:contentTeaser */
export interface ContentTeaserProps {
  /** The news item or article to show (a ctplmix:listable node), rendered with its card view. */
  "j:node"?: JCRNodeWrapper;
}
