import type { MediaProps, SectionProps } from "../shared/types.js";

/** Props of ctcm:giftOffer. jcr:title is the offer's name. */
export interface Props extends SectionProps, MediaProps {
  /** The gift ("A Dior travel pouch"). */
  gift?: string;
  /** The spend that earns the gift. */
  threshold?: number;
  /** ISO 4217 code of the threshold. */
  currency?: string;
  conditions?: string;
  /** Last day of the offer (ISO date); the offer leaves the live site the day after. */
  endsOn?: string;
}
