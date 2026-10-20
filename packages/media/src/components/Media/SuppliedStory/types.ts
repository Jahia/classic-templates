import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { Licence } from "../../../lib/briefs.js";
import type { Props as StoryProps } from "../Story/types.js";

/** Props of ctmd:suppliedStory: a story's, its moderation (ctplmix:moderated) and its own. */
export interface Props extends StoryProps {
  /** Where the story stands: submitted, inReview, accepted or declined. */
  moderationStatus?: string;
  /** The editors' note to the supplier. */
  moderationNote?: string;
  /** The brief this answers, if any. */
  brief?: JCRNodeWrapper;
  licence?: Licence;
  company?: string;
  submittedBy?: string;
}
