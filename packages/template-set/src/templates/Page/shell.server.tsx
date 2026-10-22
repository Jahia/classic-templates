import { jahiaComponent } from "@jahia/javascript-modules-library";
import { bodyViewOf, PageAreas } from "../PageAreas.jsx";
import { PageShell } from "../PageShell.jsx";
import type { PageProps } from "./types.js";

/**
 * The page shell of the template set (head, header, breadcrumb, the page's <h1>, footer, theme) around
 * a body that another module provides: that module registers a template of its own that renders this
 * view with the module parameter "body" naming a view of jnt:page it also registers, where it places
 * its areas with their allowed types and counts (a structured template next to the free "Content
 * page"):
 *
 *   <Render node={currentNode} view="ctplShell" parameters={{ body: "myStructuredBody" }} />
 *
 * Members-only pages keep their gate: a visitor held back gets the title and the notice, never the
 * body. Without a body the shell renders the title only.
 */
jahiaComponent(
  { componentType: "view", nodeType: "jnt:page", name: "ctplShell", displayName: "Page shell" },
  (
    { "jcr:title": title, "jcr:description": description, ctplHideTitle }: PageProps,
    { currentResource },
  ) => {
    const body = bodyViewOf(currentResource.getModuleParams().get("body"));
    return (
      <PageShell title={title} description={description}>
        <PageAreas title={title} hideTitle={ctplHideTitle} areas={[]} body={body} />
      </PageShell>
    );
  },
);
