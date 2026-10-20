import type { JCRNodeWrapper } from "org.jahia.services.content";

export type SessionType = "keynote" | "talk" | "panel" | "workshop" | "fireside" | "break";

/** Props of ctmd:session (mix:title and its own fields). */
export interface Props {
  "jcr:title"?: string;
  /** ISO instants. */
  "start"?: string;
  "end"?: string;
  "room"?: string;
  "stream"?: string;
  "sessionType"?: SessionType;
  /** Short text of the agenda, and the page's meta description. */
  "teaser"?: string;
  "body"?: string;
}

/** Props of ctmd:sessionSpeaker. */
export interface SpeakerProps {
  person?: JCRNodeWrapper;
  speakerRole?: "speaker" | "keynote" | "moderator" | "panellist" | "host";
}
