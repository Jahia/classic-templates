import { Render, jahiaComponent } from "@jahia/javascript-modules-library";
import { isMembersOnly } from "../../components/Editorial/shared/editorial.js";
import { PageShell } from "../PageShell.jsx";

/**
 * Full page of any jmix:mainResource item (a news item, an article) opened at its own URL.
 *
 * `priority: -1` lets a specific type register its own template later. This template owns the
 * page furniture (header, footer, `<title>`, description); the type's "fullPage" view owns the
 * content, including the page's `<h1>`, which is why no heading is passed to the shell.
 *
 * An item switched to "Members only" (ctplmix:membersOnly) goes through the "fullPageMembers" view,
 * the one cached per user, so that who sees the body never depends on who rendered the page first.
 *
 * News and articles lay out their own page width. A main resource of another module (a store of
 * js-store-locator, for example) is placed in the page container, so it lines up with the header
 * instead of starting at the edge of the window.
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
      {currentNode.isNodeType("ctplmix:editorialItem") ? (
        <Render
          node={currentNode}
          view={isMembersOnly(currentNode) ? "fullPageMembers" : "fullPage"}
        />
      ) : (
        <div className="ctpl-container">
          <Render node={currentNode} view="fullPage" />
        </div>
      )}
    </PageShell>
  ),
);
