import type { JCRNodeWrapper } from "org.jahia.services.content";

export interface Props {
  "jcr:title"?: string;
  "teaser"?: string;
  "body"?: string;
  /** ISO 8601 date string. */
  "publicationDate"?: string;
  "image"?: JCRNodeWrapper;
  /** Text alternative for this use of the image (ctplmix:media); defaults to its title. */
  "imageAlt"?: string;
  "imageDecorative"?: boolean;
  "author"?: string;
}
