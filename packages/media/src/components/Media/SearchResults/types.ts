import type { SectionProps } from "../shared/parts.js";

/** Props of ctmd:searchResults (mix:title, ctplmix:sectionStyle, ctplmix:cta and its own fields). */
export interface Props extends SectionProps {
  scope?: "site" | "network";
  pageSize?: number;
}
