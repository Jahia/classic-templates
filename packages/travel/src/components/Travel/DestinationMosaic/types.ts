import type { JCRNodeWrapper } from "org.jahia.services.content";

/** Props of ctrv:destinationMosaic. */
export interface Props {
  /** Optional section heading. */
  "jcr:title"?: string;
  /** The picked destinations; null for one deleted or not published in this workspace. */
  "destinations"?: (JCRNodeWrapper | null)[];
  /** Background of the section (ctplmix:sectionStyle). */
  "ctplSurface"?: "default" | "sunken" | "accent";
}
