import { jahiaComponent } from "@jahia/javascript-modules-library";
import type { Props } from "./types.js";
import { SubmissionCard } from "./views.js";

// The status card is the submission's only view (a submission has no page of its own); "statusCard"
// is the name the submission list asks for, and the default view is the same card. It is cached per
// user: the brief it links and the item it was used in are shown only when the visitor can read
// them, so two visitors can get two different cards (the same reasoning as the lists, see
// SubmissionList/default.server.tsx).
const properties = { "cache.perUser": "true" };
const card = (props: Props) => <SubmissionCard props={props} />;
jahiaComponent(
  { componentType: "view", nodeType: "ctmd:submission", displayName: "Status card", properties },
  card,
);
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctmd:submission",
    name: "statusCard",
    displayName: "Status card",
    properties,
  },
  card,
);
