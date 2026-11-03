import {
  AddContentButtons,
  JImage,
  Render,
  RenderChild,
  getChildNodes,
  jahiaComponent,
  server,
} from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { readPositive } from "../../../lib/props.js";
import type { Props } from "./types.js";
import classes from "./site-footer.module.css";
import { pageSite } from "../../../lib/site.js";

/** An image Jahia knows no size of (an SVG) gets the footer logo height, or it would draw 0 wide. */
const unsized = (image: JCRNodeWrapper): boolean =>
  !(readPositive(image, "j:width") && readPositive(image, "j:height"));

/**
 * The site footer: brand block (logo or site name, tagline) and link columns, then a bottom bar with the
 * copyright, legal links and social links. `{year}` in the copyright is replaced with the current
 * year, so "© {year} Company" never goes stale. The footer is seeded with a copyright, so the
 * landmark is never empty.
 */
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctpl:siteFooter",
    displayName: "Site footer",
    // {year} must turn over on 1 January: this small fragment re-renders at least once a day.
    properties: { "cache.expiration": "86400" },
  },
  ({ logo, tagline, copyright }: Props, { renderContext }) => {
    const site = pageSite(renderContext);
    server.render.addCacheDependency({ node: site }, renderContext); // the footer shows the site title
    const siteName = site.getTitle() || site.getName();
    if (logo) server.render.addCacheDependency({ node: logo }, renderContext);
    const logoClass =
      logo && unsized(logo) ? [classes.logo, classes.logoUnsized].join(" ") : classes.logo;
    const year = String(new Date().getFullYear());

    return (
      <footer className={classes.footer} data-testid="ctpl-site-footer">
        <div className={`ctpl-container ${classes.top}`}>
          <div className={classes.brand}>
            {logo ? (
              <JImage
                src={logo}
                className={logoClass}
                alt={siteName}
                data-testid="ctpl-footer-logo"
              />
            ) : (
              <p className={classes.siteName}>{siteName}</p>
            )}
            {tagline && <p className={classes.tagline}>{tagline}</p>}
          </div>
          <RenderChild name="columns" />
        </div>
        <div className={classes.bottom}>
          <div className={`ctpl-container ${classes.bottomInner}`}>
            {copyright && (
              <p className={classes.copyright} data-testid="ctpl-copyright">
                {copyright.replaceAll("{year}", year)}
              </p>
            )}
            <RenderChild name="legal" view="inline" />
            <RenderChild name="social" view="social" />
          </div>
        </div>
      </footer>
    );
  },
);

/**
 * The footer's columns, in the editor's order: a link list renders as a titled column; a navigation
 * component of another module (a Menu Manager menu) renders in the view the editor chose, across a
 * whole row of the columns, so its own columns line up with the link lists inside the footer.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:footerColumns", displayName: "Footer columns" },
  (_props, { currentNode, renderContext }) => (
    <div className={classes.columns} data-testid="ctpl-footer-columns">
      {getChildNodes(currentNode, -1).map((child: JCRNodeWrapper) =>
        child.isNodeType("ctpl:linkList") ? (
          <Render key={child.getIdentifier()} node={child} view="column" />
        ) : (
          <div
            key={child.getIdentifier()}
            className={classes.menuRow}
            data-testid="ctpl-footer-menu"
          >
            <Render node={child} />
          </div>
        ),
      )}
      {renderContext.isEditMode() && <AddContentButtons />}
    </div>
  ),
);
