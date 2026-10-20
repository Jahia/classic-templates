import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { SectionProps } from "../shared/parts.js";

/** Props of ctmd:agenda (mix:title, ctplmix:sectionStyle, ctplmix:cta and its own fields). */
export interface Props extends SectionProps {
  startNode?: JCRNodeWrapper;
  showFilters?: boolean;
}
