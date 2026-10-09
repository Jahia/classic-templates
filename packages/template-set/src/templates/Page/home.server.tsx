import { jahiaComponent } from "@jahia/javascript-modules-library";
import { PageAreas } from "../PageAreas.jsx";
import { PageShell } from "../PageShell.jsx";
import type { PageProps } from "./types.js";

/**
 * Home page: the page title (usually hidden: the seeded home page sets "hide title"), a hero
 * banner area, then full-width sections. Sections contain themselves (each
 * component centres its content with .ctpl-container or runs edge to edge).
 */
jahiaComponent(
  { componentType: "template", nodeType: "jnt:page", name: "home", displayName: "Home" },
  ({ "jcr:title": title, "jcr:description": description, ctplHideTitle }: PageProps) => (
    <PageShell title={title} description={description}>
      <PageAreas title={title} hideTitle={ctplHideTitle} areas={["hero", "main"]} />
    </PageShell>
  ),
);
