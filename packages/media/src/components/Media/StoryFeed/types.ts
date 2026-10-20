import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { Format } from "../../../lib/query.js";
import type { SectionProps } from "../shared/parts.js";

/** Props of ctmd:storyFeed (mix:title, ctplmix:sectionStyle, ctplmix:cta and its own fields). */
export interface Props extends SectionProps {
  startNode?: JCRNodeWrapper;
  pageCategories?: boolean;
  filterCategories?: JCRNodeWrapper[];
  formats?: Format[];
  maxItems?: number;
  layout?: "grid" | "list" | "lead";
  showFilter?: boolean;
}
