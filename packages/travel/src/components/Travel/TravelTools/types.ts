import type { JCRNodeWrapper } from "org.jahia.services.content";

/** Props of ctrv:travelTools (mix:title, ctplmix:sectionStyle, the notice). */
export interface Props {
  "jcr:title"?: string;
  /** Shown to every visitor above the tools ("This is a demonstration site: no booking is made"). */
  "notice"?: string;
  "ctplSurface"?: "default" | "sunken" | "accent";
}

/** Props of ctrv:travelTool (mix:title as the tab label, ctplmix:cta, text and icon). */
export interface ToolProps {
  "jcr:title"?: string;
  "text"?: string;
  "icon"?: JCRNodeWrapper;
  "ctaLabel"?: string;
  "j:linkType"?: "none" | "internal" | "external";
}
