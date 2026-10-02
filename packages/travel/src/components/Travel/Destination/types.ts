import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { Region } from "../../../lib/select.js";

/** Props of ctrv:destination (mix:title, ctplmix:media, ctrvmix:price and its own fields). */
export interface Props {
  /** The city name. */
  "jcr:title"?: string;
  /** IATA airport or city code, three capital letters ("NRT"). */
  "airportCode"?: string;
  "country"?: string;
  "region"?: Region;
  /** Short text of cards, and the page's meta description. */
  "teaser"?: string;
  "body"?: string;
  "image"?: JCRNodeWrapper;
  /** Text alternative for this use of the image (ctplmix:media); defaults to its title. */
  "imageAlt"?: string;
  "imageDecorative"?: boolean;
  /** "From" price (ctrvmix:price). */
  "price"?: number;
  "currency"?: string;
  "priceNote"?: string;
  "localCurrency"?: string;
  "language"?: string;
  "timeZone"?: string;
  "voltage"?: string;
  "diallingCode"?: string;
  "relatedDestinations"?: JCRNodeWrapper[];
}
