import { jahiaComponent } from "@jahia/javascript-modules-library";
import type { Props } from "./types.js";
import { FareCard, FareCompact, FareFull } from "./views.js";

// "fullPage" is used by the classic-templates main-resource template at the offer's own URL; "card"
// and "compact" by content lists (classic-templates ctpl:jcrQuery, this module's ctrv:fareList);
// the default view is the card. The views show whether the sale has ended, which changes with the
// date and not with the content: their cache expires after an hour.
const properties = { "cache.expiration": "3600" };
const card = (props: Props) => <FareCard props={props} />;
jahiaComponent(
  { componentType: "view", nodeType: "ctrv:fareOffer", displayName: "Card", properties },
  card,
);
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctrv:fareOffer",
    name: "card",
    displayName: "Card",
    properties,
  },
  card,
);
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctrv:fareOffer",
    name: "compact",
    displayName: "Compact",
    properties,
  },
  (props: Props) => <FareCompact props={props} />,
);
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctrv:fareOffer",
    name: "fullPage",
    displayName: "Full page",
    properties,
  },
  (props: Props) => <FareFull props={props} />,
);
