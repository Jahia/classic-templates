import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { Format } from "../../../lib/query.js";

/** Props of ctmd:story (mix:title, ctplmix:editorialItem, ctplmix:membersOnly and its own fields). */
export interface Props {
  "jcr:title"?: string;
  "format"?: Format;
  /** Short text of cards, the page's lead, and its meta description. */
  "teaser"?: string;
  "body"?: string;
  "publicationDate"?: string;
  "image"?: JCRNodeWrapper;
  "imageAlt"?: string;
  "imageDecorative"?: boolean;
  "authors"?: JCRNodeWrapper[];
  /** A video of js-media-gallery, rendered with its own view. */
  "video"?: JCRNodeWrapper;
  "audio"?: JCRNodeWrapper;
  /** WebVTT captions of the audio, in the page's language. */
  "audioCaptions"?: JCRNodeWrapper;
  "transcript"?: string;
  "ctplMembersOnly"?: boolean;
}
