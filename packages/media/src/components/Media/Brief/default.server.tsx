import { jahiaComponent } from "@jahia/javascript-modules-library";
import type { Props } from "./types.js";
import { BriefCard, BriefFull } from "./views.js";

// "fullPage" is used by the classic-templates main-resource template at the brief's own URL. It
// shows the same content to everyone who may read the brief (that is decided by the ACLs on the
// brief, not by the view), so it keeps the shared cache. "card" is used by the brief list and by
// content lists; the default view is the card.
const card = (props: Props) => <BriefCard props={props} />;
jahiaComponent({ componentType: "view", nodeType: "ctmd:brief", displayName: "Card" }, card);
jahiaComponent(
  { componentType: "view", nodeType: "ctmd:brief", name: "card", displayName: "Card" },
  card,
);
jahiaComponent(
  { componentType: "view", nodeType: "ctmd:brief", name: "fullPage", displayName: "Full page" },
  (props: Props) => <BriefFull props={props} />,
);
