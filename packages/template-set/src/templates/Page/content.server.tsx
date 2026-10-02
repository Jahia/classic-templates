import { Area, jahiaComponent } from "@jahia/javascript-modules-library";
import { PageHeading, PageShell } from "../PageShell.jsx";
import type { PageProps } from "./types.js";

/**
 * Standard inner page: the page title, an optional hero banner, then the page's sections. The h1
 * comes first so the outline never starts with the hero's h2 (RGAA 9.1).
 */
jahiaComponent(
  { componentType: "template", nodeType: "jnt:page", name: "content", displayName: "Content page" },
  ({ "jcr:title": title, "jcr:description": description, ctplHideTitle }: PageProps) => (
    <PageShell title={title} description={description}>
      <PageHeading title={title} hidden={ctplHideTitle} />
      <Area name="hero" nodeType="ctpl:heroArea" />
      <Area name="main" nodeType="ctpl:pageArea" />
    </PageShell>
  ),
);
