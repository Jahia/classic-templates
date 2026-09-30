import { AbsoluteArea, useServerContext } from "@jahia/javascript-modules-library";
import type { ReactNode } from "react";
import { chromeOwner } from "../lib/site.js";
import { Layout } from "./Layout.jsx";
import classes from "./page-shell.module.css";

/**
 * Page chrome shared by every template: the site header, the main landmark, the site footer.
 *
 * Header and footer are AbsoluteAreas owned by the home page (see chromeOwner): they render on
 * every page, are edited from the home page, and `readOnly="children"` locks them everywhere else.
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
  const { renderContext } = useServerContext();
  const owner = chromeOwner(renderContext.getSite());

  return (
    <Layout title={title} description={description}>
      <div className={classes.shell}>
        <AbsoluteArea
          name="siteHeader"
          parent={owner}
          nodeType="ctpl:headerArea"
          readOnly="children"
        />
        <main id="main-content" className={classes.main} tabIndex={-1}>
          {children}
        </main>
        <AbsoluteArea
          name="siteFooter"
          parent={owner}
          nodeType="ctpl:footerArea"
          readOnly="children"
        />
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
