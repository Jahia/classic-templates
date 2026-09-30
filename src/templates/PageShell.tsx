import { AbsoluteArea, useServerContext } from "@jahia/javascript-modules-library";
import type { ReactNode } from "react";
import { chromeOwner } from "../lib/site.js";
import { Breadcrumb } from "./Breadcrumb.jsx";
import { StructuredData } from "./StructuredData.jsx";
import { Layout } from "./Layout.jsx";
import classes from "./page-shell.module.css";

/**
 * Page chrome shared by every template: the site header, the breadcrumb trail (every page but
 * home, see Breadcrumb), the main landmark, the site footer. The breadcrumb sits before <main>,
 * so the skip link jumps over it. Every page also carries its schema.org JSON-LD (StructuredData).
 *
 * Header and footer are AbsoluteAreas owned by the home page (see chromeOwner): they render on
 * every page, are edited from the home page, and are read-only on every other page.
 * Each area only accepts its own singleton type (ctpl:headerArea / ctpl:footerArea).
 *
 * The page's one `<h1>` is placed by each template with <PageHeading> (after the hero on content
 * pages). The main-resource template renders none: the item's fullPage view owns its `<h1>`.
 */
export const PageShell = ({
  title,
  description,
  children,
}: {
  /** Short page name, used for `<title>`. */
  title?: string;
  description?: string;
  children: ReactNode;
}) => {
  const { renderContext, mainNode } = useServerContext();
  const owner = chromeOwner(renderContext.getSite());
  // Editable on the home page, locked (children included) everywhere else. Verified in the edit
  // frame with engine 1.2.0 on Jahia 8.2.3.2: readOnly="children" locks the area AND its children
  // but on every page, home included; readOnly={true} only hides the area's own marker and leaves
  // the children editable. So: false on home, "children" elsewhere.
  const readOnly = mainNode.getPath() === owner.getPath() ? false : "children";

  return (
    <Layout title={title} description={description}>
      <div className={classes.shell}>
        <AbsoluteArea
          name="siteHeader"
          parent={owner}
          nodeType="ctpl:headerArea"
          readOnly={readOnly}
        />
        <Breadcrumb />
        <main id="main-content" className={classes.main} tabIndex={-1}>
          {children}
        </main>
        <AbsoluteArea
          name="siteFooter"
          parent={owner}
          nodeType="ctpl:footerArea"
          readOnly={readOnly}
        />
        <StructuredData name={title} description={description} />
      </div>
    </Layout>
  );
};

/**
 * The page's `<h1>`, from its title. `hidden` (the page's "hide title" option) keeps it for screen
 * readers and search engines but removes it from the screen, for pages whose hero banner already
 * says it visually.
 */
export const PageHeading = ({ title, hidden }: { title?: string; hidden?: boolean }) =>
  title ? (
    <div className={hidden ? "ctpl-visually-hidden" : "ctpl-container"}>
      <h1 className={classes.heading}>{title}</h1>
    </div>
  ) : null;
