import type { JCRNodeWrapper } from "org.jahia.services.content";

/** Props of ctmd:person (mix:title, ctplmix:media and its own fields). */
export interface Props {
  /** The full name. */
  "jcr:title"?: string;
  "role"?: string;
  "organisation"?: string;
  /** Name filed under in an A-Z index; the last word of the name when empty. */
  "sortName"?: string;
  /** Short bio of cards, and the page's meta description. */
  "teaser"?: string;
  "bio"?: string;
  /** The portrait (ctplmix:media). */
  "image"?: JCRNodeWrapper;
  "imageAlt"?: string;
  "imageDecorative"?: boolean;
}
