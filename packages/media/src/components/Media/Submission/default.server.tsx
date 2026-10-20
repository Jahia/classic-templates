import { jahiaComponent } from "@jahia/javascript-modules-library";
import type { Props } from "./types.js";
import { SubmissionCard, SubmissionPage } from "./views.js";

// The status card ("statusCard", the name the submission list asks for; the default view is the same
// card) and the submission's own page ("fullPage", rendered by classic-templates' main-resource
// template). Both are cached per user: the brief they link and the item it was used in are shown
// only when the visitor can read them, so two visitors can get two different renderings (the same
// reasoning as the lists, see SubmissionList/default.server.tsx).
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
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctmd:submission",
    name: "fullPage",
    displayName: "Full page",
    properties,
  },
  (props: Props) => <SubmissionPage props={props} />,
);
