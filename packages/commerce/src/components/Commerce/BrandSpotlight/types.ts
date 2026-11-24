import type { MediaProps, PickedProps, SectionProps } from "../shared/types.js";

/** Props of ctcm:brandSpotlight. jcr:title is the brand name. */
export interface Props extends SectionProps, MediaProps, PickedProps {
  /** The line above the brand name ("Brand of the week"). */
  eyebrow?: string;
  text?: string;
}
