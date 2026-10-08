import type { JCRNodeWrapper } from "org.jahia.services.content";

export interface Props {
  "jcr:title"?: string;
  "introText"?: string;
  "afterSignIn"?: JCRNodeWrapper;
  "ctplSurface"?: "default" | "sunken" | "accent";
}
