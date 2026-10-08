import type { JCRNodeWrapper } from "org.jahia.services.content";

/** Props of ctrv:mosaic (mix:title, ctplmix:sectionStyle, the picked destinations). */
export interface Props {
  /** Optional section heading (an h2). */
  "jcr:title"?: string;
  /**
   * The picked ctrv:destination nodes, in the editor's order. Only the first four are shown; the
   * array may be empty or hold fewer items when a picked destination no longer resolves.
   */
  "destinations"?: JCRNodeWrapper[];
  "ctplSurface"?: "default" | "sunken" | "accent";
}
