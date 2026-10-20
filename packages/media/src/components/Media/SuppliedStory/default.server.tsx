import { jahiaComponent } from "@jahia/javascript-modules-library";
import type { Props } from "./types.js";
import { SuppliedStoryCard } from "./views.js";

// The status card a submission list shows to the supplier ("statusCard"). The story's own page and
// its card in the hub's lists are those of ctmd:story, which this type extends. Cached per user:
// the brief it links is shown only when the visitor can read it, and a pending story only to those
// who may read it, so two visitors can get two different cards (see SubmissionList).
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctmd:suppliedStory",
    name: "statusCard",
    displayName: "Status card",
    properties: { "cache.perUser": "true" },
  },
  (props: Props) => <SuppliedStoryCard props={props} />,
);
