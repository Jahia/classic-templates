import type { FareSort } from "../../../lib/select.js";
import type { TravelListProps } from "../shared/TravelList.js";

/** Props of ctrv:fareList (ctrvmix:travelList, ctplmix:sectionStyle, ctplmix:cta, its sort). */
export interface Props extends TravelListProps {
  sort?: FareSort;
}
