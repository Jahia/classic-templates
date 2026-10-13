import type { SectionProps } from "../shared/parts.js";

/** Props of ctmd:keyDates (mix:title, ctplmix:sectionStyle, ctplmix:cta and its own fields). */
export interface Props extends SectionProps {
  eventStart?: string;
  eventEnd?: string;
  venue?: string;
  showCountdown?: boolean;
}

/** Props of ctmd:keyDate. */
export interface KeyDateProps {
  "jcr:title"?: string;
  "date"?: string;
  "detail"?: string;
}
