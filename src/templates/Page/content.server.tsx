import { Area, jahiaComponent } from "@jahia/javascript-modules-library";
import { PageHeading, PageShell } from "../PageShell.jsx";
import type { PageProps } from "./types.js";

/** Standard inner page: an optional hero banner, the page title, then the page's sections. */
jahiaComponent(
  { componentType: "template", nodeType: "jnt:page", name: "content", displayName: "Content page" },
  ({ "jcr:title": title, "jcr:description": description, ctplHideTitle }: PageProps) => (
    <PageShell title={title} description={description}>
      <Area name="hero" nodeType="ctpl:heroArea" />
      <PageHeading title={title} hidden={ctplHideTitle} />
      <Area name="main" nodeType="ctpl:pageArea" />
    </PageShell>
  ),
);
