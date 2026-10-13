import { jahiaComponent } from "@jahia/javascript-modules-library";
import type { Props } from "./types.js";
import { PersonCard, PersonCompact, PersonFull } from "./views.js";

// "fullPage" is used by the classic-templates main-resource template at the person's own URL; it
// lists the person's stories and sessions across the sites of the instance, so it expires from the
// cache after five minutes instead of depending on every site's content. "card" and "compact" are
// used by content lists and the speaker gallery; the default view is the card.
const card = (props: Props) => <PersonCard props={props} />;
jahiaComponent({ componentType: "view", nodeType: "ctmd:person", displayName: "Card" }, card);
jahiaComponent(
  { componentType: "view", nodeType: "ctmd:person", name: "card", displayName: "Card" },
  card,
);
jahiaComponent(
  { componentType: "view", nodeType: "ctmd:person", name: "compact", displayName: "Compact" },
  (props: Props) => <PersonCompact props={props} />,
);
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctmd:person",
    name: "fullPage",
    displayName: "Full page",
    properties: { "cache.expiration": "300" },
  },
  (props: Props) => <PersonFull props={props} />,
);
