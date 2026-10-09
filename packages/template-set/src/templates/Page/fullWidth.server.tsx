import { jahiaComponent } from "@jahia/javascript-modules-library";
import { PageAreas } from "../PageAreas.jsx";
import { PageShell } from "../PageShell.jsx";
import type { PageProps } from "./types.js";

/** Landing page without a hero slot: every section is chosen by the editor in one area. */
jahiaComponent(
  {
    componentType: "template",
    nodeType: "jnt:page",
    name: "fullWidth",
    displayName: "Full-width page",
  },
  ({ "jcr:title": title, "jcr:description": description, ctplHideTitle }: PageProps) => (
    <PageShell title={title} description={description}>
      <PageAreas title={title} hideTitle={ctplHideTitle} areas={["main"]} />
    </PageShell>
  ),
);
