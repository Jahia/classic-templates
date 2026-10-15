import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { SectionProps } from "../shared/parts.js";

/** Props of ctmd:submissionList (mix:title, ctplmix:sectionStyle, ctplmix:cta and its own fields). */
export interface Props extends SectionProps {
  folder?: JCRNodeWrapper;
  maxItems?: number;
  /** Shown when nothing is listed; without it the section is left out in that case. */
  emptyText?: string;
}
