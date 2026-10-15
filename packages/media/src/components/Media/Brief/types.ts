import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { BriefStatus, MediaWanted, Usage } from "../../../lib/briefs.js";

/** Props of ctmd:brief (mix:title and its own fields). */
export interface Props {
  "jcr:title"?: string;
  /** What is needed, as rich text. */
  "description"?: string;
  /** The deadline, an ISO date. */
  "deadline"?: string;
  "mediaWanted"?: MediaWanted[];
  "quantity"?: number;
  "usage"?: Usage[];
  "briefStatus"?: BriefStatus;
  /** A mood picture; its alternative text is its title in the media library. */
  "referenceImage"?: JCRNodeWrapper;
}
