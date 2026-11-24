import type { MediaProps, PickedProps, SectionProps } from "../shared/types.js";

/** Props of ctcm:shopTheLook. jcr:title is the look's name. */
export interface Props
  extends Omit<SectionProps, "ctaLabel" | "ctaAudience" | "j:linkType">, MediaProps, PickedProps {
  intro?: string;
}
