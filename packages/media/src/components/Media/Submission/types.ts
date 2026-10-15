import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { Licence, SubmissionStatus } from "../../../lib/briefs.js";

/** Props of ctmd:submission (mix:title and its own fields). */
export interface Props {
  "jcr:title"?: string;
  "caption"?: string;
  "credit"?: string;
  "licence"?: Licence;
  /** The day the pictures were taken, an ISO date. */
  "shotDate"?: string;
  "location"?: string;
  /** The photo and video files. */
  "media"?: JCRNodeWrapper[];
  /** WebVTT files. */
  "captionsFiles"?: JCRNodeWrapper[];
  /** The brief this answers. */
  "brief"?: JCRNodeWrapper;
  "submissionStatus"?: SubmissionStatus;
  /** The picture desk's note to the supplier. */
  "deskNote"?: string;
  /** The published item that uses the accepted media. */
  "usedIn"?: JCRNodeWrapper;
  "company"?: string;
  "submittedBy"?: string;
}
