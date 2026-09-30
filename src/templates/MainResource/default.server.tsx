import { Render, jahiaComponent } from "@jahia/javascript-modules-library";
import { PageShell } from "../PageShell.jsx";

/**
 * Full page of any jmix:mainResource item (a news item, an article) opened at its own URL.
 *
 * `priority: -1` lets a specific type register its own template later. This template owns the
 * page furniture (header, footer, `<title>`, description); the type's "fullPage" view owns the
 * content, including the page's `<h1>`, which is why no heading is passed to the shell.
 */
jahiaComponent(
  {
    componentType: "template",
    nodeType: "jmix:mainResource",
    priority: -1,
    displayName: "Full page",
  },
  (
    {
      "jcr:title": title,
      "jcr:description": description,
      teaser,
    }: { "jcr:title"?: string; "jcr:description"?: string; "teaser"?: string },
    { currentNode },
  ) => (
    // News and articles have a teaser: the natural meta description when none is set.
    <PageShell title={title} description={description || teaser}>
      <Render node={currentNode} view="fullPage" />
    </PageShell>
  ),
);
