import { jahiaComponent } from "@jahia/javascript-modules-library";
import { Card, Compact, FullPage } from "../shared/editorial.js";
import type { Props } from "./types.js";

/**
 * Views of ctpl:article. "fullPage" is used by the main-resource template at the item's own URL;
 * "card" and "compact" by content lists; the default view is the card, for an item rendered
 * anywhere else.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:article", displayName: "Card" },
  (props: Props) => <Card kind="article" props={props} />,
);
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:article", name: "card", displayName: "Card" },
  (props: Props) => <Card kind="article" props={props} />,
);
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:article", name: "compact", displayName: "Compact" },
  (props: Props) => <Compact kind="article" props={props} />,
);
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:article", name: "fullPage", displayName: "Full page" },
  (props: Props) => <FullPage kind="article" props={props} />,
);
