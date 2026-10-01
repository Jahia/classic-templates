import { jahiaComponent } from "@jahia/javascript-modules-library";
import type { Props } from "./types.js";
import { DestinationCard, DestinationCompact, DestinationFull } from "./views.js";

// "fullPage" is used by the classic-templates main-resource template at the destination's own URL;
// "card" and "compact" by content lists (classic-templates ctpl:jcrQuery, this module's
// ctrv:destinationGrid); the default view is the card, for a destination rendered anywhere else.
const card = (props: Props) => <DestinationCard props={props} />;
jahiaComponent({ componentType: "view", nodeType: "ctrv:destination", displayName: "Card" }, card);
jahiaComponent(
  { componentType: "view", nodeType: "ctrv:destination", name: "card", displayName: "Card" },
  card,
);
jahiaComponent(
  { componentType: "view", nodeType: "ctrv:destination", name: "compact", displayName: "Compact" },
  (props: Props) => <DestinationCompact props={props} />,
);
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctrv:destination",
    name: "fullPage",
    displayName: "Full page",
  },
  (props: Props) => <DestinationFull props={props} />,
);
