import { jahiaComponent } from "@jahia/javascript-modules-library";
import type { Props } from "./types.js";
import { StoryCard, StoryCompact, StoryFull, StoryTile } from "./views.js";

// "fullPage" is used by the classic-templates main-resource template at the story's own URL, and
// "fullPageMembers" (cached per user) for a story switched to "Members only": a signed-in visitor
// gets the story, anyone else its teaser page, whoever rendered it first. The shared "fullPage"
// never renders the body of such a story. "card", "compact" and "tile" are used by content lists,
// story feeds and card grids; the default view is the card.
const card = (props: Props) => <StoryCard props={props} />;
jahiaComponent({ componentType: "view", nodeType: "ctmd:story", displayName: "Card" }, card);
jahiaComponent(
  { componentType: "view", nodeType: "ctmd:story", name: "card", displayName: "Card" },
  card,
);
jahiaComponent(
  { componentType: "view", nodeType: "ctmd:story", name: "compact", displayName: "Compact" },
  (props: Props) => <StoryCompact props={props} />,
);
jahiaComponent(
  { componentType: "view", nodeType: "ctmd:story", name: "tile", displayName: "Tile" },
  (props: Props) => <StoryTile props={props} />,
);
jahiaComponent(
  { componentType: "view", nodeType: "ctmd:story", name: "fullPage", displayName: "Full page" },
  (props: Props) => <StoryFull props={props} />,
);
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctmd:story",
    name: "fullPageMembers",
    displayName: "Full page (members only)",
    properties: { "cache.perUser": "true" },
  },
  (props: Props) => <StoryFull props={props} perUser />,
);
